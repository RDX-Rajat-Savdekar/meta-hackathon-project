"""LangGraph pipeline: script → voice → plan → (scene × N in parallel) → assemble."""

import json
import logging
import operator
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Annotated, Callable, TypedDict

from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send

from reelgen.agents.coders import build_scene, coder_for
from reelgen.agents.scene_planner import plan_scenes
from reelgen import library
from reelgen.agents.script import write_script
from reelgen.assemble import ffmpeg as ff
from reelgen.assemble.captions import write_ass
from reelgen.audio.align import align
from reelgen.audio.tts import concat_wavs, synthesize
from reelgen.config import get_settings
from reelgen.llm import MuseClient
from reelgen.models import RenderResult, SceneSpec, Script, Segment, SegmentAudio, WordTiming

log = logging.getLogger(__name__)

Progress = Callable[[str], None]


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


def _progress(config: RunnableConfig, stage: str) -> None:
    log.info(stage)
    cb = config.get("configurable", {}).get("progress")
    if cb:
        cb(stage)


def _save(job_dir: Path, name: str, data) -> None:
    (job_dir / name).write_text(json.dumps(data, indent=2, default=str))


def script_node(state: State, config: RunnableConfig) -> State:
    _progress(config, "writing script")
    script = write_script(MuseClient(), state["topic"])
    _save(state["job_dir"], "script.json", script.model_dump())
    return {"script": script}


def voice_node(state: State, config: RunnableConfig) -> State:
    _progress(config, "recording voiceover")
    d = state["job_dir"]

    def one(i: int) -> SegmentAudio:
        seg = state["script"].segments[i]
        wav = d / f"seg{i}.wav"
        dur = synthesize(seg.narration, wav)
        return SegmentAudio(index=i, wav=wav, duration=dur, words=[])

    with ThreadPoolExecutor(2) as pool:
        audio = list(pool.map(one, range(len(state["script"].segments))))
    _progress(config, "aligning words")
    for a, seg in zip(audio, state["script"].segments):
        a.words = align(a.wav, seg.narration, a.duration)
    _save(d, "audio.json", [a.model_dump() for a in audio])
    return {"audio": audio}


def plan_node(state: State, config: RunnableConfig) -> State:
    _progress(config, "planning scenes")
    specs = plan_scenes(MuseClient(), state["script"], state["audio"])
    _save(state["job_dir"], "plan.json", [s.model_dump() for s in specs])
    return {"specs": specs}


def fan_out(state: State) -> list[Send]:
    return [
        Send("scene", SceneTask(job_dir=state["job_dir"], topic=state["topic"], title=state["script"].title,
                                segment=state["script"].segments[spec.index], spec=spec, audio=a))
        for spec, a in zip(state["specs"], state["audio"])
    ]


def scene_node(task: SceneTask, config: RunnableConfig) -> State:
    spec = task["spec"]
    _progress(config, f"rendering segment {spec.index} ({spec.renderer.value})")
    res = build_scene(MuseClient(), coder_for(spec.renderer), spec, task["audio"], task["title"], task["job_dir"],
                      topic=task["topic"], segment=task["segment"])
    _progress(config, f"segment {spec.index} done" + (" (fallback)" if res.fallback else f" in {res.attempts} attempt(s)"))
    return {"results": [res]}


def assemble_node(state: State, config: RunnableConfig) -> State:
    _progress(config, "assembling video")
    d = state["job_dir"]
    results = sorted(state["results"], key=lambda r: r.index)
    _save(d, "results.json", [r.model_dump(exclude={"code"}) for r in results])
    fitted = [ff.fit_clip(r.video, a.duration, d / f"fit{r.index}.mp4") for r, a in zip(results, state["audio"])]
    video = ff.concat(fitted, d / "video.mp4")
    narration = d / "narration.wav"
    concat_wavs([a.wav for a in state["audio"]], narration)
    words = offset_words(state["audio"])
    final = ff.finalize(video, narration, write_ass(words, d / "captions.ass"), d / "final.mp4", get_settings().music_path)
    if get_settings().use_library:
        library.save_reel(d, state["topic"])
    _progress(config, "done")
    return {"final": final}


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


def run(topic: str, job_dir: Path, progress: Progress | None = None) -> Path:
    job_dir.mkdir(parents=True, exist_ok=True)
    (job_dir / "topic.txt").write_text(topic + "\n")
    state = build_graph().invoke(
        {"topic": topic, "job_dir": job_dir, "results": []},
        config={"configurable": {"progress": progress}, "max_concurrency": 4},
    )
    return state["final"]
