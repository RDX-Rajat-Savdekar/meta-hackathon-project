from reelgen.llm import LLMClient, complete_json
from reelgen.models import Script, SceneSpec, ScenePlan, SegmentAudio
from reelgen.prompts import load


def format_timed_words(audio: SegmentAudio) -> str:
    return " ".join(f"[{w.start:.2f}]{w.word}" for w in audio.words)


def plan_scenes(llm: LLMClient, script: Script, audio: list[SegmentAudio]) -> list[SceneSpec]:
    parts = [f"Reel: {script.title}\nCore idea: {script.idea}\n"]
    for seg, a in zip(script.segments, audio):
        parts.append(
            f"## Segment {a.index} — {seg.role} — duration {a.duration:.2f}s\n"
            f"Narration: {seg.narration}\nWriter's visual idea: {seg.visual_directive}\n"
            f"Word timings (seconds from segment start): {format_timed_words(a)}\n"
        )
    parts.append(f"Return exactly {len(audio)} scenes, one per segment, in order.")
    plan = complete_json(llm, load("scene_plan"), "\n".join(parts), ScenePlan)
    if len(plan.scenes) != len(audio):
        raise ValueError(f"planner returned {len(plan.scenes)} scenes for {len(audio)} segments")
    return [
        SceneSpec(index=a.index, renderer=p.renderer, duration=a.duration, description=p.description, beats=p.beats)
        for p, a in zip(plan.scenes, audio)
    ]
