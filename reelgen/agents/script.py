from reelgen.llm import LLMClient, complete_json
from reelgen.models import Script
from reelgen.prompts import load


def write_script(llm: LLMClient, topic: str) -> Script:
    return complete_json(llm, load("script"), f"Topic: {topic}", Script)
