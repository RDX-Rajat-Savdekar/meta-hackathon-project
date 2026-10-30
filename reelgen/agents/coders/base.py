import json
import logging
from dataclasses import dataclass
from pathlib import Path

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


def build_scene(llm: LLMClient, coder: Coder, spec: SceneSpec, audio: SegmentAudio, title: str, out_dir: Path,
                topic: str = "", segment: Segment | None = None) -> RenderResult:
    """Generate → validate → render, feeding errors back to the coder; fall back to a template card.

    Successes are saved to the asset library, and errors the loop got past become lessons for future runs.
    """
    out = out_dir / f"seg{spec.index}.mp4"
    code, err = "", ""
    errors: list[str] = []
    attempts = get_settings().max_render_attempts
    for attempt in range(1, attempts + 1):
        try:
            code = coder.fix(llm, spec, audio, code, err) if code else coder.generate(llm, spec, audio)
        except Exception as e:  # LLM/network failure: retry from scratch
            err = f"LLM call failed: {e}"
            log.warning("seg%d attempt %d: %s", spec.index, attempt, err)
            continue
        (out_dir / f"seg{spec.index}_try{attempt}{coder.renderer.suffix}").write_text(code)
        check: Check = coder.renderer.validate(code)
        if check.ok:
            check = coder.renderer.render(code, spec.duration, out)
        if check.ok:
            if get_settings().use_library:
                for e in errors:
                    library.add_lesson(spec.renderer, e)
                library.save_scene(spec, code, out, topic=topic or title, role=segment.role if segment else "",
                                   narration=segment.narration if segment else "", attempts=attempt, source=out_dir.name)
            return RenderResult(index=spec.index, renderer=spec.renderer, ok=True, video=out, code=code, attempts=attempt)
        err = check.error
        errors.append(err)
        (out_dir / f"seg{spec.index}_try{attempt}.err").write_text(err)
        log.warning("seg%d attempt %d failed: %s", spec.index, attempt, err.splitlines()[-1] if err else "")

    log.warning("seg%d: using fallback card", spec.index)
    fb = render_fallback(title, audio.words, spec.duration, out)
    if not fb.ok:
        raise RuntimeError(f"fallback render failed for segment {spec.index}: {fb.error}")
    return RenderResult(index=spec.index, renderer=spec.renderer, ok=True, video=out, code=code, attempts=attempts, error=err, fallback=True)
