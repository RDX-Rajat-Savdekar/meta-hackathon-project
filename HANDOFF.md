# HANDOFF — reelgen (automated explainer-reel pipeline)

> Last updated: 2026-10-30. Read this, then `README.md`, then run the checks
> in §5. Everything below is verified state, not aspiration.

## 1. What this is
Type a topic → director reviews a storyboard → approve → pipeline produces a
captioned 1080x1920 MP4 explainer reel (chat + dashboard UI). Three animation
engines: **Manim** (math), **Remotion/2D** (kinetic type), **Three.js/3D**
(depth). No AI-generated video — everything is code-rendered. Built for the
Meta Global AI Developer Hackathon.

## 2. Current state (all verified this session)
- Full run works: script (Muse Spark) → voice (Gemini TTS, Puck) → Whisper
  word timings → scene plan → parallel renders → captioned assembly.
- Proof: `outputs/f161be1eb7ff/final.mp4` (planes, 50.8s) and TCP reel rescued
  after a real alignment bug (see §6).
- 32/32 pytest green. Web UI served by the API itself (`web/` static mount).
- Live server (dev only): `uv run uvicorn reelgen.api:app --port 8901` →
  http://127.0.0.1:8901. It runs in someone's terminal, not hosted anywhere.

## 3. How it fits together
- `reelgen/graph.py` — LangGraph: script → voice (+align) → plan → scene
  (parallel coders) → assemble. `run()` = full; `run_approved()` = from an
  approved pitch script (skips script gen). Pitch endpoints in `reelgen/api.py`.
- `reelgen/agents/coders/` — one coder per engine; prompts in
  `reelgen/prompts/*.md` ARE the product (layout contract, determinism rules).
  Prompts are process-cached: **restart the server after editing them**.
- `reelgen/render/` — Dockerized Manim, Remotion/Chromium, per-scene
  `@remotion/player` bundles (`player_bundle.py`) for interactive chat embeds.
- `reelgen/audio/` — Gemini TTS + faster-whisper + script-anchored alignment.
- `reelgen/library/` — saved scenes/reels/lessons feed back into coder prompts.
- `reelgen/chats.py`, `reelgen/analytics.py` — server-side threads + run metrics.
- `web/` — vanilla JS chat + dashboard + storyboard review + director panel.

## 4. Setup (macOS)
```bash
brew install node ffmpeg-full colima docker
colima start --cpu 6 --memory 8
docker pull manimcommunity/manim:stable
export UV_CACHE_DIR=/tmp/uv-cache   # sandbox blocks ~/.cache; harmless outside it
uv sync
(cd remotion && npm install && npx remotion browser ensure)
cp .env.example .env   # then fill keys (see below)
uv run pytest                        # expect 32 passed
uv run uvicorn reelgen.api:app --port 8901
```
`.env` (gitignored — NEVER commit): `MUSE_API_KEY` + `MUSE_BASE_URL`
(OpenAI-compatible), `GEMINI_API_KEY` + optional `GEMINI_API_KEYS` pool,
`FFMPEG`/`FFPROBE` pointing at ffmpeg-full (libass required for captions).
Teammate: bring your own keys; the ones used so far live only in chat history.

## 5. Key decisions (do not revisit casually)
- Code-generated visuals only; stock B-roll allowed, generative video banned.
- Chat proposes a **pitch first** (cheap script-only call); pipeline runs only
  on approval. Storyboard narrations are editable and go straight to VO.
- Director's note (pitch-level) → planner hard constraint; per-scene redo note
  → "Viewer feedback" appended to the rebuild.
- Voice locked to Puck + director style prompt (probe-verified alignment-safe).
- One focal group per beat, fade-outs, caption band ≥1440 (diagrams above
  y=1300), icons never cover text — in every coder prompt (LAYOUT CONTRACT).
- Analytics/chats runtime data lives in gitignored `analytics/`, `chats/`.

## 6. Bugs we hit (so you don't re-discover them)
- Spoken style-preamble leaked into segment timings → align narration-only
  text (`graph.py` voice flow; test `test_heard_preamble_does_not_shift`).
- Bare `manim -qh` → 60fps/wrong folder: always render via the locked wrapper.
- `Text()` custom fonts collapse glyphs; never `set_width` labels; clear
  Manim text cache after font changes.
- Remotion: drive everything off `useCurrentFrame`, damping inside `config`,
  `import type`, `{"->"}` in JSX, Chromium needs ANGLE for WebGL.
- Overlaps (lock over label, counters pile-up, captions colliding): prompt
  contract + recorded lessons; structural fix still open (see §7).
- Sandbox quirks (dev machine only): no socket binds from agent shells,
  `~/.cache` unwritable (use `/tmp` caches), ports 8000/18080 blocked.

## 7. Pending work (in priority order)
1. **True orbit in Explore** — Player scrubs but camera is fixed. Add an
   `interactive` prop to `remotion/src/kit/Scene3D.tsx` (drei OrbitControls
   behind a `window.__REELGEN_INTERACTIVE__` flag set by `player.mjs`),
   rebuild bundles, backfill library three scenes.
2. **Vision QA gate** — screenshot each scene at 3 timestamps, vision-model
   review for overlaps/small text/caption collisions, auto-feed findings as
   redo notes. (Automates our "inspect PNGs yourself" rule.)
3. **Bounded asset library** — kit components declaring bounding boxes
   (Title, CaptionChip, LockBadge…); planner composes from catalog on a grid.
4. **BYOK in UI** — keys still server-side in `.env`; add chat key/model picker.
5. **Spelling QA** in the fix loop; **Manim maiden render** (Docker ready,
   never used); voice cloning later.
6. Uncommitted overflow: keep `outputs/`, `.venv`, `node_modules`, `.env`
   out of git (all ignored). Commit prompts + web + tests + library code/meta.

## 8. Working agreements
- Smallest correct fix at root cause; reproduce against real code first.
- New behavior ships with a focused test (`tests/test_api.py`,
  `tests/test_align.py`); full suite must stay green.
- Docs live with code: new footgun → row in the relevant prompt + lesson via
  `reelgen library add-lesson <engine> "<error>" --note "<fix>"`.
- Never commit `.env`, `outputs/`, keys, or `*.mp4` (all ignored — verify).
