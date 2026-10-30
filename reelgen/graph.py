"""LangGraph pipeline: script → voice → plan → (scene × N in parallel) → assemble.

Every step reports structured events through an `emit(type, **data)` callback (passed in the run config) so the
UI can stream exactly what is happening, including each scene's attempts and errors.
"""

import json
import logging
import operator
from pathlib import Path
from typing import Annotated, Callable, TypedDict

from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send

from reelgen import library
from reelgen.agents.coders import build_scene, coder_for
from reelgen.agents.scene_planner import plan_scenes
from reelgen.agents.script import write_script
from reelgen.assemble import ffmpeg as ff
from reelgen.assemble.captions import write_ass
from reelgen.audio.align import align, segment_cuts
from reelgen.audio.tts import concat_wavs, split_wav, synthesize
from reelgen.config import get_settings
from reelgen.llm import MuseClient
from reelgen.models import RenderResult, SceneSpec, Script, Segment, SegmentAudio, WordTiming

log = logging.getLogger(__name__)

Emit = Callable[..., None]  # emit(type: str, **data)

STAGES = {
    "script": "Writing the script",
    "voice": "Recording the voiceover",
    "align": "Syncing every word to the audio",
    "plan": "Directing the scenes",
    "render": "Animating scenes",
    "assemble": "Assembling and captioning",
}


def _noop(type: str, **data) -> None:
    log.info("%s %s", type, data)


def _emit(config: RunnableConfig) -> Emit:
    return config.get("configurable", {}).get("emit") or _noop


def _stage(emit: Emit, stage: str) -> None:
    emit("stage", stage=stage, label=STAGES[stage])


class State(TypedDict, total=False):
    job_dir: Path
    topic: str
    script: Script
    audio: list[SegmentAudio]
    specs: list[SceneSpec]
    results: Annotated[list[RenderResult], operator.add]
    final: Path


class SceneTask(TypedDict):
    job_dir: Path
    topic: str
    title: str
    segment: Segment
    spec: SceneSpec
    audio: SegmentAudio


def _save(job_dir: Path, name: str, data) -> None:
    (job_dir / name).write_text(json.dumps(data, indent=2, default=str))


def script_node(state: State, config: RunnableConfig) -> State:
    emit = _emit(config)
    _stage(emit, "script")
    script = write_script(MuseClient(), state["topic"])
    _save(state["job_dir"], "script.json", script.model_dump())
    emit("script", script=script.model_dump())
    return {"script": script}


def voice_node(state: State, config: RunnableConfig) -> State:
    emit = _emit(config)
    _stage(emit, "voice")
    d = state["job_dir"]
    segments = state["script"].segments
    # One TTS request for the whole script (Gemini free tier allows 3/min), split by word timings after.
    full = d / "voice_full.wav"
    text = "\n\n".join(s.narration for s in segments)
    info: dict = {}
    duration = synthesize(text, full, info=info)
    emit("voice", duration=round(duration, 2), provider=info.get("provider", "gemini"), note=info.get("note", ""))
    _stage(emit, "align")
    words = align(full, text, duration)
    counts = [len(s.narration.split()) for s in segments]
    cuts = segment_cuts(words, counts)
    wavs = [d / f"seg{i}.wav" for i in range(len(segments))]
    split_wav(full, cuts, wavs)
    edges = [0.0, *cuts, duration]
    audio, k = [], 0
    for i, n in enumerate(counts):
        t0 = edges[i]
        seg_words = [WordTiming(word=w.word, start=round(w.start - t0, 3), end=round(w.end - t0, 3)) for w in words[k : k + n]]
        audio.append(SegmentAudio(index=i, wav=wavs[i], duration=round(edges[i + 1] - t0, 3), words=seg_words))
        k += n
    _save(d, "audio.json", [a.model_dump() for a in audio])
    return {"audio": audio}


def plan_node(state: State, config: RunnableConfig) -> State:
    emit = _emit(config)
    _stage(emit, "plan")
    specs = plan_scenes(MuseClient(), state["script"], state["audio"])
    _save(state["job_dir"], "plan.json", [s.model_dump() for s in specs])
    emit("plan", scenes=[
        {"index": s.index, "role": state["script"].segments[s.index].role, "renderer": s.renderer.value,
         "duration": s.duration, "description": s.description}
        for s in specs
    ])
    _stage(emit, "render")
    return {"specs": specs}


def fan_out(state: State) -> list[Send]:
    return [
        Send("scene", SceneTask(job_dir=state["job_dir"], topic=state["topic"], title=state["script"].title,
                                segment=state["script"].segments[spec.index], spec=spec, audio=a))
        for spec, a in zip(state["specs"], state["audio"])
    ]


def scene_node(task: SceneTask, config: RunnableConfig) -> State:
    spec = task["spec"]
    res = build_scene(MuseClient(), coder_for(spec.renderer), spec, task["audio"], task["title"], task["job_dir"],
                      topic=task["topic"], segment=task["segment"], emit=_emit(config))
    return {"results": [res]}


def assemble_node(state: State, config: RunnableConfig) -> State:
    final = assemble_job(state["job_dir"], state["audio"], state["results"], state["topic"], _emit(config))
    return {"final": final}


def assemble_job(d: Path, audio: list[SegmentAudio], results: list[RenderResult], topic: str, emit: Emit = _noop) -> Path:
    """Fit clips to their narration, concat, mux audio, burn captions; save to the library."""
    _stage(emit, "assemble")
    results = sorted(results, key=lambda r: r.index)
    _save(d, "results.json", [r.model_dump(exclude={"code"}) for r in results])
    fitted = [ff.fit_clip(r.video, a.duration, d / f"fit{r.index}.mp4") for r, a in zip(results, audio)]
    video = ff.concat(fitted, d / "video.mp4")
    narration = d / "narration.wav"
    concat_wavs([a.wav for a in audio], narration)
    words = offset_words(audio)
    final = ff.finalize(video, narration, write_ass(words, d / "captions.ass"), d / "final.mp4", get_settings().music_path)
    if get_settings().use_library:
        library.save_reel(d, topic)
    emit("done", duration=round(sum(a.duration for a in audio), 2))
    return final


def offset_words(audio: list[SegmentAudio]) -> list[WordTiming]:
    """Shift each segment's word timings by the total duration of the segments before it."""
    out, t0 = [], 0.0
    for a in audio:
        out += [WordTiming(word=w.word, start=w.start + t0, end=w.end + t0) for w in a.words]
        t0 += a.duration
    return out


def build_graph():
    g = StateGraph(State)
    g.add_node("script", script_node)
    g.add_node("voice", voice_node)
    g.add_node("plan", plan_node)
    g.add_node("scene", scene_node)
    g.add_node("assemble", assemble_node)
    g.add_edge(START, "script")
    g.add_edge("script", "voice")
    g.add_edge("voice", "plan")
    g.add_conditional_edges("plan", fan_out, ["scene"])
    g.add_edge("scene", "assemble")
    g.add_edge("assemble", END)
    return g.compile()


def run(topic: str, job_dir: Path, emit: Emit | None = None) -> Path:
    job_dir.mkdir(parents=True, exist_ok=True)
    (job_dir / "topic.txt").write_text(topic + "\n")
    state = build_graph().invoke(
        {"topic": topic, "job_dir": job_dir, "results": []},
        config={"configurable": {"emit": emit or _noop}, "max_concurrency": 4},
    )
    return state["final"]


# ---------- re-rendering a single scene ----------

def load_job(d: Path) -> tuple[Script, list[SegmentAudio], list[SceneSpec], list[RenderResult]]:
    script = Script.model_validate_json((d / "script.json").read_text())
    audio = [SegmentAudio.model_validate(a) for a in json.loads((d / "audio.json").read_text())]
    specs = [SceneSpec.model_validate(s) for s in json.loads((d / "plan.json").read_text())]
    results = [RenderResult.model_validate(r) for r in json.loads((d / "results.json").read_text())]
    return script, audio, specs, results


def retry_scene(d: Path, index: int, note: str = "", renderer: str | None = None, emit: Emit = _noop) -> Path:
    """Regenerate one scene (optionally with viewer feedback or a different renderer), then reassemble."""
    from reelgen.models import Renderer

    script, audio, specs, results = load_job(d)
    topic = (d / "topic.txt").read_text().strip() if (d / "topic.txt").exists() else script.title
    spec = specs[index].model_copy()
    if renderer:
        spec.renderer = Renderer(renderer)
    if note:
        spec.description += f"\n\nViewer feedback for this new version (follow it): {note}"
    specs[index] = spec
    _save(d, "plan.json", [s.model_dump() for s in specs])
    _stage(emit, "render")
    res = build_scene(MuseClient(), coder_for(spec.renderer), spec, audio[index], script.title, d,
                      topic=topic, segment=script.segments[index], emit=emit)
    results = [res if r.index == index else r for r in results]
    return assemble_job(d, audio, results, topic, emit)
