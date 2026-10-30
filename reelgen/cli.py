import logging
import re
import time
import uuid
from pathlib import Path

import typer

from reelgen.config import get_settings

app = typer.Typer(add_completion=False, help="Generate short-form science explainer reels.")
lib = typer.Typer(add_completion=False, help="Asset library: saved scenes, reels and lessons.")
app.add_typer(lib, name="library")


def _slug(topic: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", topic.lower()).strip("-")[:40] + "-" + uuid.uuid4().hex[:6]


@app.command()
def make(topic: str, out: Path = typer.Option(None, help="Job directory (default outputs/<slug>)")):
    """Topic → finished 1080x1920 reel."""
    from reelgen.graph import run

    logging.basicConfig(level=logging.WARNING, format="%(levelname)s %(name)s: %(message)s")
    job = out or get_settings().outputs_dir / _slug(topic)
    t0 = time.time()
    final = run(topic, job, progress=lambda s: typer.echo(f"[{time.time() - t0:6.1f}s] {s}"))
    typer.echo(f"\n✓ {final}")


@app.command("render-scene")
def render_scene(file: Path, duration: float = 4.0, out: Path = typer.Option(None)):
    """Validate and render a hand-written scene (.py = Manim, .tsx = Remotion/Three)."""
    from reelgen.render.manim_renderer import ManimRenderer
    from reelgen.render.remotion_renderer import RemotionRenderer

    renderer = ManimRenderer() if file.suffix == ".py" else RemotionRenderer()
    code = file.read_text()
    out = out or get_settings().outputs_dir / "scenes" / f"{file.stem}.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    check = renderer.validate(code)
    if check.ok:
        check = renderer.render(code, duration, out)
    if not check.ok:
        typer.echo(check.error, err=True)
        raise typer.Exit(1)
    typer.echo(f"✓ {out}")


@app.command()
def voice(text: str, out: Path = Path("outputs/voice.wav")):
    """Synthesize text and print word timings."""
    from reelgen.audio.align import align
    from reelgen.audio.tts import synthesize

    out.parent.mkdir(parents=True, exist_ok=True)
    dur = synthesize(text, out)
    for w in align(out, text, dur):
        typer.echo(f"{w.start:6.2f} {w.end:6.2f}  {w.word}")
    typer.echo(f"✓ {out} ({dur:.2f}s)")


@lib.command("list")
def lib_list(renderer: str = typer.Option(None, help="manim | remotion | three")):
    """List saved scenes."""
    from reelgen import library
    from reelgen.models import Renderer

    rows = library.scenes(Renderer(renderer) if renderer else None)
    for meta, _ in rows:
        star = "★" if meta.starred else " "
        typer.echo(f"{star} {meta.id:32} {meta.role:9} {meta.duration:5.1f}s  {meta.topic[:30]:30}  {meta.description[:60]}")
    reels = sorted((library.LIBRARY / "reels").glob("*/topic.txt"))
    typer.echo(f"\n{len(rows)} scenes, {len(reels)} reels, {len(library.lessons())} lessons in {library.LIBRARY}")


@lib.command("import")
def lib_import(job_dirs: list[Path]):
    """Backfill the library from finished outputs/<job> directories."""
    from reelgen import library

    for d in job_dirs:
        saved = library.import_job(d)
        typer.echo(f"✓ {d.name}: {len(saved)} scenes")


@lib.command("star")
def lib_star(scene_id: str, off: bool = typer.Option(False, "--off", help="Unstar instead")):
    """Star a scene so it is preferred as an example in future prompts."""
    from reelgen import library

    library.set_star(scene_id, not off)
    typer.echo(f"{'unstarred' if off else '★ starred'} {scene_id}")


@lib.command("rm")
def lib_rm(scene_id: str):
    """Remove a scene (e.g. one that looks bad) so it is never used as an example."""
    from reelgen import library

    library.remove(scene_id)
    typer.echo(f"removed {scene_id}")


@lib.command("lessons")
def lib_lessons():
    """Show recorded pitfalls fed to the coders."""
    from reelgen import library

    for l in library.lessons():
        typer.echo(f"[{l['renderer']}] {l['error']}" + (f"  → {l['note']}" if l.get("note") else ""))


@lib.command("add-lesson")
def lib_add_lesson(renderer: str, error: str, note: str = typer.Option("", help="How to avoid it")):
    """Record a pitfall by hand."""
    from reelgen import library
    from reelgen.models import Renderer

    library.add_lesson(Renderer(renderer), error, note)
    typer.echo("✓ lesson added")


if __name__ == "__main__":
    app()
