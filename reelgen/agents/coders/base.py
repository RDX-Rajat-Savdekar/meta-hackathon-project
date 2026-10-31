import json
import logging
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from reelgen import library
from reelgen.config import get_settings
from reelgen.llm import LLMClient, extract_block
from reelgen.models import RenderResult, SceneSpec, Segment, SegmentAudio
from reelgen.prompts import load
from reelgen.render.base import Check, Renderer
from reelgen.render.fallback import render_fallback

log = logging.getLogger(__name__)


@dataclass
class Coder:
    """Writes scene code for one renderer and repairs it from error messages."""

    system: str
    renderer: Renderer

    def task(self, spec: SceneSpec, audio: SegmentAudio) -> str:
        words = " ".join(f"[{w.start:.2f}]{w.word}" for w in audio.words)
        return (
            f"Target duration: {spec.duration:.2f}s ({round(spec.duration * 30)} frames at 30fps).\n\n"
            f"Scene description:\n{spec.description}\n\n"
            f"Beats (seconds from scene start):\n{json.dumps([b.model_dump() for b in spec.beats], indent=1)}\n\n"
            f"Narration word timings: {words}"
        ) + (f"\n\n{library.prompt_context(spec)}" if get_settings().use_library else "")

    def generate(self, llm: LLMClient, spec: SceneSpec, audio: SegmentAudio) -> str:
        return extract_block(llm.complete(self.system, self.task(spec, audio)))

    def fix(self, llm: LLMClient, spec: SceneSpec, audio: SegmentAudio, code: str, error: str) -> str:
        user = f"{self.task(spec, audio)}\n\n{load('fix')}\n\nCode:\n```\n{code}\n```\n\nError:\n```\n{error[-3000:]}\n```"
        return extract_block(llm.complete(self.system, user))


def _summary(error: str) -> str:
    """One readable line for the UI: the most telling line of an error."""
    lines = [ln.strip() for ln in error.strip().splitlines() if ln.strip()]
    for ln in reversed(lines):
        if re.search(r"Error|error TS|Banned|not allowed|timed out|failed", ln):
            return ln[:240]
    return (lines[-1] if lines else "unknown error")[:240]


def build_scene(llm: LLMClient, coder: Coder, spec: SceneSpec, audio: SegmentAudio, title: str, out_dir: Path,
                topic: str = "", segment: Segment | None = None, emit: Callable[..., None] | None = None) -> RenderResult:
    """Generate → validate → render, feeding errors back to the coder; fall back to a template card.

    Every step is reported via `emit("scene", ...)`. Successes are saved to the asset library, and errors the loop
    got past become lessons for future runs.
    """
    emit = emit or (lambda *a, **k: None)
    i, r = spec.index, spec.renderer.value
    out = out_dir / f"seg{spec.index}.mp4"
    code, err = "", ""
    errors: list[str] = []
    attempts = get_settings().max_render_attempts
    for attempt in range(1, attempts + 1):
        emit("scene", index=i, renderer=r, status="fixing" if code else "coding", attempt=attempt, max_attempts=attempts)
        try:
            code = coder.fix(llm, spec, audio, code, err) if code else coder.generate(llm, spec, audio)
        except Exception as e:  # LLM/network failure: retry from scratch
            err = f"LLM call failed: {e}"
            log.warning("seg%d attempt %d: %s", spec.index, attempt, err)
            emit("scene", index=i, renderer=r, status="error", attempt=attempt, max_attempts=attempts,
                 stage="writing code", error=_summary(err), detail=err[-1500:])
            continue
        (out_dir / f"seg{spec.index}_try{attempt}{coder.renderer.suffix}").write_text(code)
        emit("scene", index=i, renderer=r, status="checking", attempt=attempt, max_attempts=attempts)
        check: Check = coder.renderer.validate(code)
        stage = "checking code"
        if check.ok:
            emit("scene", index=i, renderer=r, status="rendering", attempt=attempt, max_attempts=attempts)
            check = coder.renderer.render(code, spec.duration, out)
            stage = "rendering"
        if check.ok:
            if get_settings().use_library:
                for e in errors:
                    library.add_lesson(spec.renderer, e)
                library.save_scene(spec, code, out, topic=topic or title, role=segment.role if segment else "",
                                   narration=segment.narration if segment else "", attempts=attempt, source=out_dir.name)
            player = False
            if spec.renderer.value == "three":
                # Best-effort interactive preview bundle; never fails the scene.
                from reelgen.render.player_bundle import build_player_bundle
                seg_tsx = out_dir / f"seg{spec.index}.tsx"
                if seg_tsx.exists():
                    res = build_player_bundle(seg_tsx, spec.duration, out_dir / f"seg{spec.index}.player.js")
                    player = res.ok
                    if not res.ok:
                        log.warning("seg%d: no interactive preview: %s", spec.index, res.error)
            emit("scene", index=i, renderer=r, status="done", attempt=attempt, max_attempts=attempts, player=player)
            return RenderResult(index=spec.index, renderer=spec.renderer, ok=True, video=out, code=code, attempts=attempt)
        err = check.error
        errors.append(err)
        (out_dir / f"seg{spec.index}_try{attempt}.err").write_text(err)
        log.warning("seg%d attempt %d failed: %s", spec.index, attempt, err.splitlines()[-1] if err else "")
        emit("scene", index=i, renderer=r, status="error", attempt=attempt, max_attempts=attempts,
             stage=stage, error=_summary(err), detail=err[-1500:])

    log.warning("seg%d: using fallback card", spec.index)
    emit("scene", index=i, renderer=r, status="fallback_rendering", attempt=attempts, max_attempts=attempts)
    fb = render_fallback(title, audio.words, spec.duration, out)
    if not fb.ok:
        emit("scene", index=i, renderer=r, status="failed", error=_summary(fb.error), detail=fb.error[-1500:])
        raise RuntimeError(f"fallback render failed for segment {spec.index}: {fb.error}")
    emit("scene", index=i, renderer=r, status="fallback", attempt=attempts, max_attempts=attempts,
         error=_summary(err) if err else "", detail=err[-1500:] if err else "")
    return RenderResult(index=spec.index, renderer=spec.renderer, ok=True, video=out, code=code, attempts=attempts, error=err, fallback=True)
