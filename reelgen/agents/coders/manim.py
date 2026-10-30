from reelgen.agents.coders.base import Coder
from reelgen.prompts import load
from reelgen.render.manim_renderer import ManimRenderer


def manim_coder() -> Coder:
    return Coder(system=load("manim_code"), renderer=ManimRenderer())
