import asyncio
import json
from contextlib import asynccontextmanager
import logging
import threading
import time
import uuid
from pathlib import Path
from typing import Literal

from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from reelgen.config import ROOT, get_settings
from reelgen.models import JobState, JobStatus, Renderer, Script

log = logging.getLogger(__name__)
JOBS: dict[str, JobState] = {}
EVENTS: dict[str, list[dict]] = {}
_lock = threading.Lock()


class JobRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=500)
    renderer: Renderer | None = Field(default=None, description="Preferred engine for every scene; null = director picks")
    thread_id: str | None = Field(default=None, max_length=64, description="Chat thread to file this job under")


class RetryRequest(BaseModel):
    note: str = Field(default="", max_length=500)
    renderer: Renderer | None = None


# ---------- job + event persistence ----------

def _job_dir(job_id: str) -> Path:
    return get_settings().outputs_dir / job_id


def _persist(job: JobState) -> None:
    d = _job_dir(job.id)
    d.mkdir(parents=True, exist_ok=True)
    (d / "state.json").write_text(job.model_dump_json(indent=2))


def _load(job_id: str) -> JobState | None:
    if job_id in JOBS:
        return JOBS[job_id]
    if not job_id.isalnum():
        return None
    f = _job_dir(job_id) / "state.json"
    return JobState.model_validate(json.loads(f.read_text())) if f.exists() else None


def _events(job_id: str) -> list[dict]:
    with _lock:
        if job_id not in EVENTS:
            f = _job_dir(job_id) / "events.jsonl"
            EVENTS[job_id] = [json.loads(ln) for ln in f.read_text().splitlines() if ln.strip()] if f.exists() else []
        return EVENTS[job_id]


def _emitter(job: JobState):
    """emit(type, **data): append to the job's event log (memory + events.jsonl) and keep JobState in sync."""
    events = _events(job.id)
    path = _job_dir(job.id) / "events.jsonl"

    def emit(type: str, **data) -> None:
        with _lock:
            ev = {"seq": len(events), "t": round(time.time(), 2), "type": type, **data}
            events.append(ev)
            with open(path, "a") as f:
                f.write(json.dumps(ev, default=str) + "\n")
        if type == "stage":
            job.stage = data["label"]
            job.log.append(data["stage"])
            _persist(job)

    return emit


def _friendly(e: Exception) -> str:
    msg = str(e)
    if "RESOURCE_EXHAUSTED" in msg or " 429" in msg:
        return "The voice service hit its rate limit. Wait a minute and try again."
    if "MUSE" in msg or "api.meta.ai" in msg:
        return "The script model (Muse) is unavailable right now. Try again shortly."
    return msg.splitlines()[0][:300] if msg else e.__class__.__name__


def _execute(job: JobState, work) -> None:
    """Run `work(emit)` for a job, recording success/failure as events."""
    emit = _emitter(job)
    job.status, job.error = JobStatus.running, ""
    _persist(job)
    try:
        job.video = work(emit)
        job.status = JobStatus.done
    except Exception as e:
        log.exception("job %s failed", job.id)
        job.status, job.error = JobStatus.failed, _friendly(e)
        emit("failed", stage=job.log[-1] if job.log else "", error=job.error, detail=str(e)[-2000:])
    job.finished = time.time()
    _persist(job)
    try:
        from reelgen import analytics
        analytics.record_job(job.id)
    except Exception:
        pass  # analytics must never break a job


def _mark_orphans() -> None:
    """Jobs left running by a previous server process will never finish; say so instead of spinning forever."""
    for f in get_settings().outputs_dir.glob("*/state.json"):
        job = JobState.model_validate_json(f.read_text())
        if job.status in (JobStatus.queued, JobStatus.running):
            job.status, job.error, job.finished = JobStatus.failed, "Interrupted by a server restart. Try again.", time.time()
            _persist(job)
            _emitter(job)("failed", stage=job.log[-1] if job.log else "", error=job.error, detail="")


@asynccontextmanager
async def _lifespan(_app: FastAPI):
    _mark_orphans()
    yield


app = FastAPI(title="reelgen", lifespan=_lifespan)


# ---------- jobs ----------

@app.post("/jobs", status_code=202)
def create_job(req: JobRequest, background: BackgroundTasks) -> JobState:
    from reelgen.graph import run

    job = JobState(id=uuid.uuid4().hex[:12], topic=req.topic.strip(), preferred_renderer=req.renderer,
                   thread_id=(req.thread_id or None), created=time.time())
    JOBS[job.id] = job
    _persist(job)
    if job.thread_id:
        try:
            from reelgen import chats
            chats.attach(job.thread_id, job.id, job.topic)
        except (ValueError, OSError):
            job.thread_id = None
            _persist(job)
    _emitter(job)("queued", topic=job.topic,
                  renderer=req.renderer.value if req.renderer else None)
    background.add_task(_execute, job, lambda emit: run(job.topic, _job_dir(job.id), emit,
                                                        preferred_renderer=(req.renderer.value if req.renderer else None)))
    return job


@app.get("/jobs/{job_id}")
def get_job(job_id: str) -> JobState:
    job = _load(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    return job


@app.get("/jobs/{job_id}/events")
async def stream_events(job_id: str, request: Request, after: int = -1):
    """Server-sent events: replays the job's event log after `after`, then streams new ones until it finishes."""
    if not _load(job_id):
        raise HTTPException(404, "job not found")
    last_id = request.headers.get("last-event-id")
    start = int(last_id) + 1 if last_id and last_id.isdigit() else after + 1

    async def gen():
        i, idle = start, 0.0
        yield "retry: 2000\n\n"
        while True:
            events = _events(job_id)
            while i < len(events):
                yield f"id: {i}\ndata: {json.dumps(events[i], default=str)}\n\n"
                i += 1
                idle = 0.0
            job = _load(job_id)
            if job and job.status in (JobStatus.done, JobStatus.failed) and i >= len(_events(job_id)):
                yield f"event: end\ndata: {json.dumps({'status': job.status.value})}\n\n"
                return
            if await request.is_disconnected():
                return
            await asyncio.sleep(0.3)
            idle += 0.3
            if idle >= 15:
                yield ": keep-alive\n\n"
                idle = 0.0

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.get("/jobs/{job_id}/details")
def get_job_details(job_id: str) -> dict:
    if not _load(job_id):
        raise HTTPException(404, "job not found")
    d = _job_dir(job_id)
    read = lambda n: json.loads((d / n).read_text()) if (d / n).exists() else None  # noqa: E731
    return {"script": read("script.json"), "plan": read("plan.json"), "results": read("results.json")}


@app.get("/jobs/{job_id}/video")
def get_video(job_id: str) -> FileResponse:
    job = _load(job_id)
    if not job or not job.video or not Path(job.video).exists():
        raise HTTPException(404, "video not ready")
    return FileResponse(job.video, media_type="video/mp4", filename=f"reel-{job_id}.mp4",
                        headers={"Cache-Control": "no-store"})


@app.get("/jobs/{job_id}/scenes/{index}/clip")
def get_scene_clip(job_id: str, index: int) -> FileResponse:
    f = _job_dir(job_id) / f"seg{index}.mp4"
    if not _load(job_id) or not f.exists():
        raise HTTPException(404, "scene not rendered")
    return FileResponse(f, media_type="video/mp4", headers={"Cache-Control": "no-store"})


def _player_bundle(job_id: str, index: int) -> Path:
    f = _job_dir(job_id) / f"seg{index}.player.js"
    if not _load(job_id) or not f.exists():
        raise HTTPException(404, "no interactive preview for this scene")
    return f


@app.get("/jobs/{job_id}/scenes/{index}/player")
def get_scene_player(job_id: str, index: int) -> HTMLResponse:
    from reelgen.render.player_bundle import player_page

    _player_bundle(job_id, index)
    job = _load(job_id)
    return HTMLResponse(player_page(job.topic if job else f"scene {index}"))


@app.get("/jobs/{job_id}/scenes/{index}/player.js")
def get_scene_player_js(job_id: str, index: int) -> FileResponse:
    return FileResponse(_player_bundle(job_id, index), media_type="application/javascript",
                        headers={"Cache-Control": "no-store"})


@app.post("/jobs/{job_id}/scenes/{index}/retry", status_code=202)
def retry_scene(job_id: str, index: int, req: RetryRequest, background: BackgroundTasks) -> JobState:
    """Regenerate one scene (optionally with a note or another renderer) and reassemble the reel."""
    from reelgen.graph import retry_scene as do_retry

    job = _load(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if job.status == JobStatus.running:
        raise HTTPException(409, "job is still running")
    d = _job_dir(job_id)
    if not (d / "results.json").exists() or not (d / "plan.json").exists():
        raise HTTPException(409, "this job never reached the scene stage; start a new one")
    plan = json.loads((d / "plan.json").read_text())
    if not 0 <= index < len(plan):
        raise HTTPException(404, "no such scene")
    JOBS[job.id] = job
    _emitter(job)("retry", index=index, note=req.note, renderer=req.renderer.value if req.renderer else plan[index]["renderer"])
    renderer = req.renderer.value if req.renderer else None
    background.add_task(_execute, job, lambda emit: do_retry(d, index, req.note, renderer, emit))
    job.status = JobStatus.running
    return job


# ---------- library (samples for the home page) ----------

def _reel_dir(name: str) -> Path:
    root = (get_settings().library_dir / "reels").resolve()
    d = (root / name).resolve()
    if d.parent != root or not d.is_dir():
        raise HTTPException(404, "reel not found")
    return d


class ThreadCreate(BaseModel):
    title: str = Field(default="Untitled chat", max_length=120)


class ThreadAttach(BaseModel):
    job_id: str = Field(min_length=3, max_length=64)


class PitchRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=500)
    renderer: Renderer | None = None
    target_length: Literal["short", "standard", "deep"] = "standard"
    thread_id: str | None = Field(default=None, max_length=64)
    note: str = Field(default="", max_length=2000, description="Director's note, e.g. use a timeline view")


class PitchApprove(BaseModel):
    script: Script | None = None
    renderer: Renderer | None = None
    thread_id: str | None = Field(default=None, max_length=64)
    note: str | None = Field(default=None, max_length=2000)


def _pitch_dir(pid: str) -> Path:
    return get_settings().outputs_dir / "pitches" / pid


def _run_pitch(pid: str, req: PitchRequest) -> None:
    """Script-only pass: cheap first iteration for director review."""
    from reelgen.agents.script import write_script
    from reelgen.graph import LENGTH_HINTS
    from reelgen.llm import MuseClient

    d = _pitch_dir(pid)
    d.mkdir(parents=True, exist_ok=True)
    pitch = {"id": pid, "topic": req.topic.strip(), "status": "writing",
             "renderer": req.renderer.value if req.renderer else None,
             "target_length": req.target_length, "note": req.note or "",
             "created": time.time(), "script": None, "error": ""}
    (d / "pitch.json").write_text(json.dumps(pitch))
    try:
        hint = LENGTH_HINTS.get(req.target_length, "")
        script = write_script(MuseClient(), req.topic.strip() + hint)
        pitch.update(status="ready", script=script.model_dump())
    except Exception as e:
        log.exception("pitch %s failed", pid)
        pitch.update(status="failed", error=_friendly(e))
    (d / "pitch.json").write_text(json.dumps(pitch, default=str))


@app.post("/pitches", status_code=202)
def create_pitch(req: PitchRequest, background: BackgroundTasks) -> dict:
    pid = uuid.uuid4().hex[:12]
    background.add_task(_run_pitch, pid, req)
    return {"id": pid, "status": "writing", "topic": req.topic.strip()}


@app.get("/pitches/{pid}")
def get_pitch(pid: str) -> dict:
    if not pid.isalnum():
        raise HTTPException(404, "unknown pitch")
    f = _pitch_dir(pid) / "pitch.json"
    if not f.exists():
        raise HTTPException(404, "unknown pitch")
    return json.loads(f.read_text())


@app.post("/pitches/{pid}/approve", status_code=202)
def approve_pitch(pid: str, req: PitchApprove, background: BackgroundTasks) -> JobState:
    from reelgen.graph import run_approved

    if not pid.isalnum():
        raise HTTPException(404, "unknown pitch")
    f = _pitch_dir(pid) / "pitch.json"
    if not f.exists():
        raise HTTPException(404, "unknown pitch")
    pitch = json.loads(f.read_text())
    if pitch.get("status") != "ready" or not pitch.get("script"):
        raise HTTPException(409, "pitch is not ready for review yet")
    script = Script.model_validate(req.script) if req.script else Script.model_validate(pitch["script"])
    renderer = req.renderer or (Renderer(pitch["renderer"]) if pitch.get("renderer") else None)
    thread_id = req.thread_id or None
    note = req.note if req.note is not None else pitch.get("note", "")
    job = JobState(id=uuid.uuid4().hex[:12], topic=pitch["topic"], preferred_renderer=renderer,
                   thread_id=thread_id, created=time.time())
    JOBS[job.id] = job
    _persist(job)
    if thread_id:
        try:
            from reelgen import chats
            chats.attach(thread_id, job.id, job.topic)
        except (ValueError, OSError):
            job.thread_id = None
            _persist(job)
    background.add_task(_execute, job, lambda emit: run_approved(
        job.topic, _job_dir(job.id), script, emit,
        preferred_renderer=(renderer.value if renderer else None), note=note or ""))
    return job


@app.post("/chats", status_code=201)
def create_thread(req: ThreadCreate) -> dict:
    from reelgen import chats
    return chats.create(req.title)


@app.get("/chats")
def list_threads() -> list[dict]:
    from reelgen import chats
    return chats.list_threads()


@app.get("/chats/{thread_id}")
def get_thread(thread_id: str) -> dict:
    from reelgen import chats
    t = chats.get(thread_id)
    if t is None:
        raise HTTPException(404, "unknown chat")
    return {**t, "summaries": [s for jid in t["jobs"] for s in [chats.job_summary(jid)] if s]}


@app.post("/chats/{thread_id}/jobs", status_code=201)
def attach_job(thread_id: str, req: ThreadAttach) -> dict:
    from reelgen import chats
    try:
        return chats.attach(thread_id, req.job_id)
    except ValueError:
        raise HTTPException(400, "bad thread id")


@app.get("/analytics/summary")
def analytics_summary() -> dict:
    from reelgen import analytics
    return analytics.summary()


@app.get("/library/reels")
def list_reels() -> list[dict]:
    out = []
    for d in (get_settings().library_dir / "reels").glob("*/"):
        read = lambda n: json.loads((d / n).read_text()) if (d / n).exists() else None  # noqa: E731
        script = read("script.json") or {}
        plan = read("plan.json") or []
        audio = read("audio.json") or []
        topic = (d / "topic.txt").read_text().strip() if (d / "topic.txt").exists() else script.get("title", d.name)
        out.append({
            "name": d.name,
            "topic": topic,
            "title": script.get("title", topic),
            "hook": (script.get("segments") or [{}])[0].get("narration", ""),
            "renderers": sorted({p["renderer"] for p in plan}),
            "duration": round(sum(a.get("duration", 0) for a in audio), 1),
            "has_video": (d / "final.mp4").exists(),
            "mtime": d.stat().st_mtime,
        })
    return sorted(out, key=lambda r: -r["mtime"])


@app.get("/library/reels/{name}/video")
def reel_video(name: str) -> FileResponse:
    f = _reel_dir(name) / "final.mp4"
    if not f.exists():
        raise HTTPException(404, "video not stored locally")
    return FileResponse(f, media_type="video/mp4")


@app.get("/library/reels/{name}/strip")
def reel_strip(name: str) -> FileResponse:
    f = _reel_dir(name) / "strip.png"
    if not f.exists():
        raise HTTPException(404, "no strip")
    return FileResponse(f, media_type="image/png")


@app.get("/library/scenes")
def list_scenes() -> list[dict]:
    from reelgen import library

    return [
        {"id": m.id, "renderer": m.renderer.value, "role": m.role, "topic": m.topic, "description": m.description[:220],
         "duration": m.duration, "starred": m.starred, "has_clip": (p / "clip.mp4").exists(),
         "has_player": (p / "player.js").exists()}
        for m, p in library.scenes()
    ]


def _scene_file(scene_id: str, name: str) -> FileResponse:
    root = (get_settings().library_dir / "scenes").resolve()
    f = (root / scene_id / name).resolve()
    if f.parent.parent != root or not f.exists():
        raise HTTPException(404, "not found")
    return FileResponse(f)


@app.get("/library/scenes/{scene_id}/clip")
def scene_clip(scene_id: str) -> FileResponse:
    return _scene_file(scene_id, "clip.mp4")


@app.get("/library/scenes/{scene_id}/thumb")
def scene_thumb(scene_id: str) -> FileResponse:
    return _scene_file(scene_id, "thumb.png")


@app.get("/library/scenes/{scene_id}/player")
def library_scene_player(scene_id: str) -> HTMLResponse:
    from reelgen.render.player_bundle import player_page

    _scene_file(scene_id, "player.js")  # 404s unless the bundle exists
    return HTMLResponse(player_page(scene_id.replace("-", " ")))


@app.get("/library/scenes/{scene_id}/player.js")
def library_scene_player_js(scene_id: str) -> FileResponse:
    return _scene_file(scene_id, "player.js")


# Three.js is already installed for Remotion; serve that copy so the UI works offline.
app.mount("/vendor/three", StaticFiles(directory=ROOT / "remotion/node_modules/three/build"), name="three")
app.mount("/", StaticFiles(directory=ROOT / "web", html=True), name="web")
