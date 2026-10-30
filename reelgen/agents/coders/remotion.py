from reelgen.agents.coders.base import Coder
from reelgen.prompts import load
from reelgen.render.remotion_renderer import RemotionRenderer


def remotion_coder() -> Coder:
    system = load("remotion_code").replace("{{THREE_IMPORTS}}", "").replace("{{KIT}}", load("kit"))
    return Coder(system=system, renderer=RemotionRenderer())
