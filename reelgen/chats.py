"""Server-side chat threads: groups of jobs, like an AI chat app history."""

import time
from pathlib import Path

from reelgen.config import get_settings

VALID = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.")


def _dir() -> Path:
    d = get_settings().chats_dir
    d.mkdir(parents=True, exist_ok=True)
    return d


def _check(tid: str) -> str:
    if not tid or any(c not in VALID for c in tid):
        raise ValueError("bad thread id")
    return tid


def create(title: str, tid: str | None = None) -> dict:
    import uuid

    tid = _check(tid or uuid.uuid4().hex[:12])
    now = time.time()
    thread = {"id": tid, "title": (title or "Untitled chat")[:120], "created": now, "updated": now, "jobs": []}
    (_dir() / f"{tid}.json").write_text(__import__("json").dumps(thread))
    return thread


def get(tid: str) -> dict | None:
    import json

    f = _dir() / f"{_check(tid)}.json"
    return json.loads(f.read_text()) if f.exists() else None


def list_threads() -> list[dict]:
    import json

    out = []
    for f in _dir().glob("*.json"):
        try:
            t = json.loads(f.read_text())
            out.append({"id": t["id"], "title": t.get("title", ""), "updated": t.get("updated", 0),
                        "jobs": len(t.get("jobs", []))})
        except (ValueError, KeyError):
            continue
    return sorted(out, key=lambda t: t["updated"], reverse=True)


def attach(tid: str, job_id: str, topic: str = "") -> dict:
    """Append a job to a thread, creating the thread (titled by topic) if needed."""
    import json

    t = get(tid)
    if t is None:
        t = create(topic or "Untitled chat", tid)
    if job_id not in t["jobs"]:
        t["jobs"].append(job_id)
    t["updated"] = time.time()
    if topic and t["title"] == "Untitled chat":
        t["title"] = topic[:120]
    (_dir() / f"{t['id']}.json").write_text(json.dumps(t))
    return t


def job_summary(job_id: str) -> dict | None:
    """Small card for a job, from its persisted state (no pipeline run)."""
    import json

    from reelgen.models import JobState

    f = get_settings().outputs_dir / job_id / "state.json"
    if not f.exists():
        return None
    try:
        job = JobState.model_validate_json(f.read_text())
    except ValueError:
        return None
    renderers: list[str] = []
    rf = get_settings().outputs_dir / job_id / "results.json"
    if rf.exists():
        try:
            for r in json.loads(rf.read_text()):
                v = r.get("renderer")
                if v and v not in renderers:
                    renderers.append(v)
        except ValueError:
            pass
    return {"id": job.id, "topic": job.topic, "status": job.status.value,
            "renderers": renderers, "finished": job.finished,
            "has_video": bool(job.video and (get_settings().outputs_dir / job_id / "final.mp4").exists())}
