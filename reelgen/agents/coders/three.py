from reelgen.agents.coders.base import Coder
from reelgen.prompts import load
from reelgen.render.remotion_renderer import RemotionRenderer

THREE_IMPORTS = ', "three", "@remotion/three", "@react-three/fiber", "@react-three/drei"'


def three_coder() -> Coder:
    system = (
        load("remotion_code").replace("{{THREE_IMPORTS}}", THREE_IMPORTS).replace("{{KIT}}", load("kit"))
        + load("three_extra")
    )
    return Coder(system=system, renderer=RemotionRenderer())
