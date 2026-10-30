import json
import re
from typing import Protocol, TypeVar

from openai import OpenAI
from pydantic import BaseModel, ValidationError

from reelgen.config import get_settings

T = TypeVar("T", bound=BaseModel)

_FENCE = re.compile(r"```(?:\w+)?\s*\n(.*?)```", re.S)


class LLMClient(Protocol):
    def complete(self, system: str, user: str) -> str: ...


class MuseClient:
    """Muse Spark via its OpenAI-compatible API."""

    def __init__(self, model: str | None = None):
        s = get_settings()
        if not s.muse_base_url or not s.muse_api_key:
            raise RuntimeError("MUSE_BASE_URL and MUSE_API_KEY must be set in .env")
        self.client = OpenAI(base_url=s.muse_base_url, api_key=s.muse_api_key)
        self.model = model or s.muse_model

    def complete(self, system: str, user: str) -> str:
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        )
        return resp.choices[0].message.content or ""


def extract_block(text: str) -> str:
    """Return the first fenced code block, or the text itself if there is none."""
    m = _FENCE.search(text)
    return (m.group(1) if m else text).strip()


def complete_json(llm: LLMClient, system: str, user: str, schema: type[T], retries: int = 1) -> T:
    system = (
        f"{system}\n\nRespond with only a JSON object matching this JSON schema:\n"
        f"{json.dumps(schema.model_json_schema())}"
    )
    prompt = user
    for attempt in range(retries + 1):
        raw = llm.complete(system, prompt)
        try:
            return schema.model_validate_json(extract_block(raw))
        except ValidationError as e:
            if attempt == retries:
                raise
            prompt = f"{user}\n\nYour previous answer was invalid:\n{e}\nReturn corrected JSON only."
    raise AssertionError("unreachable")
