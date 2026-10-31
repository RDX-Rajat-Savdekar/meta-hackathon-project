"""API tests against a fake pipeline (no Muse/Gemini calls)."""

import json

import pytest
from fastapi.testclient import TestClient

import reelgen.graph
from reelgen import api
from reelgen.config import get_settings


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(get_settings(), "outputs_dir", tmp_path)
    monkeypatch.setattr(api, "JOBS", {})
    monkeypatch.setattr(api, "EVENTS", {})
    return TestClient(api.app)


def sse(client, url):
    events, kind = [], None
    with client.stream("GET", url) as r:
        for line in r.iter_lines():
            if line.startswith("event: "):
                kind = line[7:]
            elif line.startswith("data: "):
                payload = json.loads(line[6:])
                events.append(("end", payload) if kind == "end" else ("event", payload))
                if kind == "end":
                    break
                kind = None
    return events


def fake_run(topic, job_dir, emit, preferred_renderer=None):
    emit("stage", stage="script", label="Writing the script")
    emit("plan", scenes=[{"index": 0, "role": "hook", "renderer": "three", "duration": 3.0, "description": "d"}])
    emit("scene", index=0, renderer="three", status="error", attempt=1, max_attempts=3, stage="rendering",
         error="TypeError: x is undefined", detail="...")
    emit("scene", index=0, renderer="three", status="done", attempt=2, max_attempts=3)
    video = job_dir / "final.mp4"
    video.write_bytes(b"mp4")
    emit("done", duration=3.0)
    return video


def test_job_streams_events_then_ends(client, monkeypatch):
    monkeypatch.setattr(reelgen.graph, "run", fake_run)
    job = client.post("/jobs", json={"topic": "tcp handshake"}).json()  # background task completes before return
    events = sse(client, f"/jobs/{job['id']}/events")
    types = [e[1].get("type") for e in events if e[0] == "event"]
    assert types == ["queued", "stage", "plan", "scene", "scene", "done"]
    assert events[-1] == ("end", {"status": "done"})
    err = [e[1] for e in events if e[1].get("status") == "error"][0]
    assert err["index"] == 0 and "TypeError" in err["error"]
    # resuming after seq 3 only replays later events
    later = sse(client, f"/jobs/{job['id']}/events?after=3")
    assert [e[1]["seq"] for e in later if e[0] == "event"] == [4, 5]
    assert client.get(f"/jobs/{job['id']}/video").content == b"mp4"


def test_failure_is_reported_as_event(client, monkeypatch):
    def boom(topic, job_dir, emit, preferred_renderer=None):
        emit("stage", stage="voice", label="Recording the voiceover")
        raise RuntimeError("429 RESOURCE_EXHAUSTED quota")

    monkeypatch.setattr(reelgen.graph, "run", boom)
    job = client.post("/jobs", json={"topic": "black holes"}).json()
    events = sse(client, f"/jobs/{job['id']}/events")
    failed = [e[1] for e in events if e[1].get("type") == "failed"][0]
    assert failed["stage"] == "voice" and "rate limit" in failed["error"]
    assert client.get(f"/jobs/{job['id']}").json()["status"] == "failed"


def test_retry_scene_runs_and_streams(client, monkeypatch, tmp_path):
    monkeypatch.setattr(reelgen.graph, "run", fake_run)
    job = client.post("/jobs", json={"topic": "dna"}).json()
    d = tmp_path / job["id"]
    (d / "plan.json").write_text(json.dumps([{"index": 0}]))
    (d / "results.json").write_text("[]")
    seen = {}

    def fake_retry(job_dir, index, note, renderer, emit):
        seen.update(index=index, note=note, renderer=renderer)
        emit("scene", index=index, renderer=renderer, status="done", attempt=1, max_attempts=3)
        emit("done", duration=3.0)
        return job_dir / "final.mp4"

    monkeypatch.setattr(reelgen.graph, "retry_scene", fake_retry)
    r = client.post(f"/jobs/{job['id']}/scenes/0/retry", json={"note": "bigger text", "renderer": "manim"})
    assert r.status_code == 202
    assert seen == {"index": 0, "note": "bigger text", "renderer": "manim"}
    events = sse(client, f"/jobs/{job['id']}/events?after=5")
    assert [e[1].get("type") for e in events if e[0] == "event"] == ["retry", "scene", "done"]
    assert client.post(f"/jobs/{job['id']}/scenes/7/retry", json={}).status_code == 404


def test_unknown_job_404(client):
    assert client.get("/jobs/nope").status_code == 404
    assert client.get("/jobs/nope/events").status_code == 404


def test_chat_thread_lifecycle(client, monkeypatch, tmp_path):
    monkeypatch.setattr(get_settings(), "chats_dir", tmp_path / "chats")
    monkeypatch.setattr(get_settings(), "outputs_dir", tmp_path)
    t = client.post("/chats", json={"title": "planes"}).json()
    assert t["title"] == "planes" and t["jobs"] == []
    from reelgen.models import JobState

    d = tmp_path / "abc123"
    d.mkdir()
    (d / "state.json").write_text(JobState(id="abc123", topic="lift").model_dump_json())
    r = client.post(f"/chats/{t['id']}/jobs", json={"job_id": "abc123"})
    assert r.status_code == 201 and r.json()["jobs"] == ["abc123"]
    got = client.get(f"/chats/{t['id']}").json()
    assert got["summaries"][0]["topic"] == "lift"
    assert client.get("/chats/does-not-exist").status_code == 404
    assert any(x["id"] == t["id"] for x in client.get("/chats").json())


def test_analytics_summary_from_fixture(client, monkeypatch, tmp_path):
    import json as _json

    monkeypatch.setattr(get_settings(), "analytics_dir", tmp_path / "analytics")
    monkeypatch.setattr(get_settings(), "outputs_dir", tmp_path)
    from reelgen import analytics
    from reelgen.models import JobState

    d = tmp_path / "abc123"
    d.mkdir()
    (d / "state.json").write_text(JobState(id="abc123", topic="lift", status="done",
                                           created=100.0, finished=125.0).model_dump_json())
    (d / "events.jsonl").write_text("\n".join(_json.dumps(e) for e in [
        {"seq": 0, "t": 100.0, "type": "queued", "topic": "lift"},
        {"seq": 1, "t": 100.0, "type": "stage", "stage": "script", "label": "Writing"},
        {"seq": 2, "t": 105.0, "type": "stage", "stage": "voice", "label": "Voice"},
        {"seq": 3, "t": 115.0, "type": "voice", "duration": 10.0, "provider": "gemini"},
        {"seq": 4, "t": 115.0, "type": "stage", "stage": "render", "label": "Animate"},
        {"seq": 5, "t": 116.0, "type": "scene", "index": 0, "renderer": "three", "status": "coding", "attempt": 1, "max_attempts": 3},
        {"seq": 6, "t": 120.0, "type": "scene", "index": 0, "renderer": "three", "status": "done", "attempt": 1, "max_attempts": 3},
        {"seq": 7, "t": 120.0, "type": "stage", "stage": "assemble", "label": "Assemble"},
        {"seq": 8, "t": 125.0, "type": "done", "duration": 10.0},
    ]))
    (d / "results.json").write_text("[]")
    row = analytics.record_job("abc123")
    assert row and row["status"] == "done" and row["stages"]["voice"] == 10.0
    s = client.get("/analytics/summary").json()
    assert s["jobs"] == 1 and s["success_rate"] == 1.0
    assert s["renderers"]["three"]["done"] == 1
    assert s["voice_providers"] == {"gemini": 1}


def test_library_scenes_expose_player_flag(client):
    scenes = client.get("/library/scenes").json()
    assert scenes, "expected library scenes from the repo"
    for s in scenes:
        assert isinstance(s["has_player"], bool)


def test_missing_player_is_404(client, tmp_path):
    from reelgen.models import JobState

    assert client.get("/library/scenes/nope/player").status_code == 404
    assert client.get("/library/scenes/nope/player.js").status_code == 404
    # A job dir with no player bundle, created without starting a pipeline run.
    d = tmp_path / "abc123"
    d.mkdir()
    (d / "state.json").write_text(JobState(id="abc123", topic="black holes").model_dump_json())
    assert client.get("/jobs/abc123/scenes/0/player").status_code == 404
    assert client.get("/jobs/abc123/scenes/0/player.js").status_code == 404
