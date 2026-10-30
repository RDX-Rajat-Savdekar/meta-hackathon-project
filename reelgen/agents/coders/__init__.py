from reelgen.agents.coders.base import Coder, build_scene
from reelgen.agents.coders.manim import manim_coder
from reelgen.agents.coders.remotion import remotion_coder
from reelgen.agents.coders.three import three_coder
from reelgen.models import Renderer

CODERS = {Renderer.manim: manim_coder, Renderer.remotion: remotion_coder, Renderer.three: three_coder}


def coder_for(renderer: Renderer) -> Coder:
    return CODERS[renderer]()


__all__ = ["Coder", "build_scene", "coder_for"]
