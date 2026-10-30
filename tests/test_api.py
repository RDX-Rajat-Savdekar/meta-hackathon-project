from fastapi.testclient import TestClient

import reelgen.graph
from reelgen import api
from reelgen.config import get_settings


def test_job_lifecycle(tmp_path, monkeypatch):
    monkeypatch.setattr(get_settings(), "outputs_dir", tmp_path)

    def fake_run(topic, job_dir, progress):
        progress("writing script")
        video = job_dir / "final.mp4"
        video.write_bytes(b"mp4")
        return video

    monkeypatch.setattr(reelgen.graph, "run", fake_run)
    client = TestClient(api.app)

    job = client.post("/jobs", json={"topic": "tcp"}).json()  # background task runs before the response returns
    state = client.get(f"/jobs/{job['id']}").json()
    assert state["status"] == "done" and state["stage"] == "writing script"
    assert client.get(f"/jobs/{job['id']}/video").content == b"mp4"
    assert client.get("/jobs/nope").status_code == 404
