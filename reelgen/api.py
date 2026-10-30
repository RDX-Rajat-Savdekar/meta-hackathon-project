import json
import logging
import uuid

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from reelgen.config import get_settings
from reelgen.models import JobState, JobStatus

log = logging.getLogger(__name__)
app = FastAPI(title="reelgen")
JOBS: dict[str, JobState] = {}


class JobRequest(BaseModel):
    topic: str


def _persist(job: JobState) -> None:
    d = get_settings().outputs_dir / job.id
    d.mkdir(parents=True, exist_ok=True)
    (d / "state.json").write_text(job.model_dump_json(indent=2))


def _load(job_id: str) -> JobState | None:
    if job_id in JOBS:
        return JOBS[job_id]
    f = get_settings().outputs_dir / job_id / "state.json"
    return JobState.model_validate(json.loads(f.read_text())) if f.exists() else None


def _run(job: JobState) -> None:
    from reelgen.graph import run

    def progress(stage: str) -> None:
        job.stage = stage
        _persist(job)

    job.status = JobStatus.running
    try:
        job.video = run(job.topic, get_settings().outputs_dir / job.id, progress)
        job.status = JobStatus.done
    except Exception as e:
        log.exception("job %s failed", job.id)
        job.status, job.error = JobStatus.failed, str(e)
    _persist(job)


@app.post("/jobs", status_code=202)
def create_job(req: JobRequest, background: BackgroundTasks) -> JobState:
    job = JobState(id=uuid.uuid4().hex[:12], topic=req.topic)
    JOBS[job.id] = job
    _persist(job)
    background.add_task(_run, job)
    return job


@app.get("/jobs/{job_id}")
def get_job(job_id: str) -> JobState:
    job = _load(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    return job


@app.get("/jobs/{job_id}/video")
def get_video(job_id: str) -> FileResponse:
    job = _load(job_id)
    if not job or job.status != JobStatus.done or not job.video:
        raise HTTPException(404, "video not ready")
    return FileResponse(job.video, media_type="video/mp4", filename=f"{job_id}.mp4")
