import time
import wave
from pathlib import Path

from google import genai
from google.genai import errors, types

from reelgen.config import get_settings

SAMPLE_RATE = 24_000
STYLE = "Say this energetically and clearly, like a punchy tech explainer on Instagram Reels:"


def _client() -> genai.Client:
    return genai.Client(api_key=get_settings().gemini_api_key)


def synthesize(text: str, out: Path, voice: str | None = None, retries: int = 4) -> float:
    """Synthesize `text` to a 24kHz mono wav at `out`. Returns duration in seconds."""
    s = get_settings()
    config = types.GenerateContentConfig(
        response_modalities=["AUDIO"],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice or s.gemini_tts_voice)
            )
        ),
    )
    client = _client()
    for attempt in range(retries + 1):
        try:
            resp = client.models.generate_content(
                model=s.gemini_tts_model, contents=f"{STYLE} {text}", config=config
            )
            break
        except errors.APIError as e:
            if e.code != 429 or attempt == retries:
                raise
            time.sleep(2 ** (attempt + 1))
    pcm = resp.candidates[0].content.parts[0].inline_data.data
    out.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(pcm)
    return len(pcm) / 2 / SAMPLE_RATE


def concat_wavs(wavs: list[Path], out: Path) -> None:
    """Concatenate same-format wavs (all produced by `synthesize`)."""
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        for p in wavs:
            with wave.open(str(p), "rb") as r:
                w.writeframes(r.readframes(r.getnframes()))
