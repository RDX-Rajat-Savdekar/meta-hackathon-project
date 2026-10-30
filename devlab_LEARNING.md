# Creator Lab — LEARNING.md

> **What this is:** every hard-won issue and fix from building programmatic
> explainer videos in this lab, distilled so a new agent can produce
> publishable work without rediscovering the footguns.
> **How to use it:** read §1–§3 plus §12 (the rules) before touching any
> video task, then the tool sections (§4–§7) for the tool you were assigned. Append new lessons
> to §11 using the row format — never bury a lesson only in chat.
> Sources: `docs/video-production/` (esp. `MANIM-AGENT-LESSONS.md`,
> `05-LESSONS-LEARNED.md`, `04-AGENT-ONBOARDING.md`), `TOOL_TRADEOFFS.md`,
> `LEARNING_JOURNAL.md`, `projects/interview-shorts/` and its `voice/`,
> `tools/`, `shorts/` folders. All paths below are repo-relative to
> rdx-dev-creator-lab unless noted. (§12 lists the non-negotiable rules;
> keep them satisfied while following every other section.)

## 1. The pipeline (memorize this)

Every narrated short follows **VO-first** gates — no exceptions:

```
script.txt → Gemini TTS (Puck) → ffprobe duration → animate to VO
  → preview render → frame extract + self-inspect PNGs
  → safe-zone overlay QA → final render → mux_vo.py → posted/
```

- **Never animate before the VO exists.** Visuals-first caused video/VO
  length mismatches that had to be re-rendered. Duration truth comes from
  `ffprobe` on the rendered VO wav, never from plan targets.
- **Never ask the user to QA basic layout.** Render low-res, extract frames
  with ffmpeg, open the PNGs, inspect them yourself, fix overlap/kerning/
  clipping/small text — only then show the user or render final.
- **One concept + one punchline per short.** On-screen: title + diagram
  labels + punchline. Do NOT burn the full VO script as captions —
  Instagram auto-captions already eat the bottom of the frame.

## 2. Repo map (where things live)

| Path | What lives there | Why it matters |
|------|------------------|----------------|
| `docs/video-production/` | Playbooks: `00-QUICK-START.md`, Manim/VO/tool references, `04-AGENT-ONBOARDING.md`, `05-LESSONS-LEARNED.md`, `MANIM-AGENT-LESSONS.md`, `07-NEW-PROJECT-SETUP.md` | Read before any video task; generic process lives here, not in project folders |
| `projects/interview-shorts/` | The `interview_labs` channel pipeline (Manim + Gemini TTS, 9:16) | The proven end-to-end reference implementation |
| `projects/interview-shorts/voice/` | `LIKED_VOICES.md` (brand voice lock), `narrator_style.txt` (director prompt) | Voice identity; read before generating any VO |
| `projects/interview-shorts/tools/` | `generate_tts.py`, `mux_vo.py`, `render_short.sh`, `qa_safe_overlay.py` | Use these helpers; do not invent render flags |
| `projects/interview-shorts/shorts/` | Per-short folders (`01-response-time/`, `02-percentiles/`), each with `BEATS.md`, `scenes/`, `manim.cfg` | Beat sheet + scene code live together |
| `projects/interview-shorts/posted/` | Final upload-ready MP4s + README table | Copy here ONLY when ready to post |
| `projects/interview-shorts/safe_zone.py` | `safe_bounds()` helper | Single source of truth for layout margins |
| `learning/` | Per-tool playgrounds (godot, remotion, motion-canvas, R3F, scrollytelling, reactflow basics) | Where new-tool spikes happen before production use |
| `TOOL_TRADEOFFS.md` | 6-tool comparison + content-type recommendations | Which tool to pick for a new brief |
| `LEARNING_JOURNAL.md` | Per-playground implementations, gotchas, research extensions | Deeper context per tool |

## 3. Canonical commands (interview-shorts)

```bash
# VO (brand voice Puck — always pass explicitly; CLI default is Charon)
.venv/bin/python projects/interview-shorts/tools/generate_tts.py \
  --file projects/interview-shorts/shorts/01-response-time/script.txt \
  --voice Puck

# Preview portrait (fast iteration)
../../tools/render_short.sh scenes/response_time.py ResponseTimeBreakdown preview
# → -ql, 480x854, 15fps

# Final 4K master (2160x3840 @ locked 30fps) and IG upload master (1080x1920)
../../tools/render_short.sh scenes/response_time.py ResponseTimeBreakdown final
../../tools/render_short.sh scenes/response_time.py ResponseTimeBreakdown ig

# Mux (freeze-pads video when VO is longer)
.venv/bin/python ../../tools/mux_vo.py \
  --video output/video_4k.mp4 --audio output/vo_puck.wav \
  --out output/final_response_time_puck.mp4

# Safe-zone QA on mid + late frames
ffmpeg -y -ss <mid> -i output/preview_portrait.mp4 -frames:v 1 output/qa_mid.png
ffmpeg -y -ss <late> -i output/preview_portrait.mp4 -frames:v 1 output/qa_late.png
.venv/bin/python projects/interview-shorts/tools/qa_safe_overlay.py output/qa_mid.png output/qa_late.png
```

## 4. Manim — text, labels, and layout footguns

| Mistake | What happened | Fix |
|---------|---------------|-----|
| `Text(..., font="Helvetica Neue")` | Multi-word labels collapsed (`Networklatency`), letters overlapped (Manim/Pango shaping) | Prefer **`DejaVu Sans`** or omit custom font entirely |
| `set_width()` / stretching a label to match a brace span | Squished, warped glyphs | Never stretch text — place with `next_to`, keep natural aspect |
| Hand-spacing words with large `buff` to "fix" gaps | Huge gaps (`Network····latency`) | One `Text("Network latency")` in a good font; hand-space only if necessary |
| Trusting Manim's text cache after font/label changes | Old broken glyphs reappear | `rm -rf media/texts media/Text` after any font or label-pipeline change |
| `font_size` ≤16 on dense labels | Looks glitchy even at 480p preview | Brace labels ≥18–22; re-inspect at final resolution |
| Scaling a `VGroup` containing readable `Text` | Kerning/weight looks wrong | Size text via `font_size`; scale shapes only |
| Arrow labels on the shaft midpoint | Collides with the V / chord | Offset outside: left of request arrow, right of response arrow |
| `BraceBetweenPoints` + auto-fitted label | Warped or detached label | Explicit underline/bracket `Line`s + independent `Text`, or brace without width-fitting |
| Dots for Client/Service nodes | Cheap look | SVG icons via `SVGMobject` (set color/height); don't scale text with the icon group |
| Hand-drawn icons | Inconsistent stroke/quality | SVG assets, always |
| All beats in one Scene | Unreviewable monolith, slow iteration | One act/scene per file; layout-plop scene before motion scene |
| Wrong venv `manim` after repo rename | Stale shebang runs wrong env | Always `path/to/.venv/bin/python -m manim ...` |
| ffmpeg concat with relative paths | Silent wrong-file / failure | **Absolute paths** in concat list files |

House label style: `Text("Network latency", font="DejaVu Sans", font_size=20, color=ACCENT)`.

## 5. Gemini TTS — voice pipeline issues

- **Brand voice is Puck (locked).** `voice/LIKED_VOICES.md`: use Puck for all
  posted shorts unless the user explicitly A/B's another voice. A/B pool:
  Umbriel, Sadaltager, Charon, Algieba, Algenib (male); Gacrux, Aoede
  (female/guest). `output/vo/` sample wavs (Charon, Iapetus, Sadaltager,
  Schedar) are the receipts of past A/B rounds.
- **CLI default is Charon, not Puck** (`generate_tts.py --voice` defaults to
  `Charon`). Always pass `--voice Puck` explicitly or you will ship the wrong
  voice. `posted/README.md` records per-file voice — check it before upload.
- **A/B fast, don't full-render samples.** CLI TTS is sequential and waits for
  the full WAV with the full style prompt prepended. For voice comparison use
  `--no-style` + short text. Flash model (`gemini-2.5-flash-preview-tts`) for
  shorts; Pro only for longer narration.
- **Preview in AI Studio first.** aistudio.google.com speech/TTS playground —
  try the voice + style notes there before locking anything.
- **Narrator style (PrepFrames host):** calm collected host, 3Blue1Brown /
  Sebastian Lague energy, male-presenting mid register, never salesy. Warm but
  precise, slight smile never grin, measured pacing with micro-pauses, key
  terms lightly emphasized. No urgency, no "let's dive in", no influencer
  cadence. Pronunciation: Redis "RED-iss", PostgreSQL "post-gres", cache
  "cash"; spell out acronyms first use ("L R U cache"). Slightly slower than
  podcast speed; beat after each definition. Full text: `voice/narrator_style.txt`.

## 6. Story, pacing, and density (explainers)

- **Simple outer shape first, then expand and reveal** — never build every
  piece left→right. Reference: `shorts/01-response-time/BEATS.md`: tight
  Client↔Service round trip → stretch the middle gap (ease-out ~2.5–3s) →
  reveal queueing delay, then service time → final full response-time bracket.
- **~20s per diagram short**, `run_time` 0.4–0.6s per draw, short holds;
  spend the time budget on the expand, not the draws. A 45s single-diagram
  short is a pacing failure — cut or split it.
- Inner pieces `FadeIn`/`GrowFromCenter` only *after* enough gap exists.
  Big summary bracket appears only at the end.
- When VO outlasts video: freeze the last frame (`tpad=stop_mode=clone`) or
  lengthen waits *after measuring the VO* — never cut audio with `-shortest`,
  never pad with black.

## 7. Other tools — gotchas already paid for

**Remotion** (React video; UI mockups, dashboards, data flow):
- Drive styles purely via `interpolate`/`spring` on `useCurrentFrame()` —
  CSS `transition: all` causes non-pure flicker.
- Assets must live in local `public/` and load via `staticFile()` or the dev
  server 404s. Composition IDs: alphanumeric + hyphens only (underscores crash
  the compiler). Raw `->` in JSX crashes webpack — use `{"->"}` or `&rarr;`.
- `@remotion/skia`: render elements directly under `<SkiaCanvas>`, no nested
  Canvas wrappers (reconciler crash). `react-native` type errors: add
  `src/react-native-stubs.d.ts`, set `noUnusedLocals: false`.
- Headless Chromium WebGL failure (`failed to create webgl context`): set
  `Config.setChromiumOpenGlRenderer("angle")` in `remotion.config.ts`.
- TS `verbatimModuleSyntax`: type-only imports must use `import type`.

**Motion Canvas** (code walkthroughs, flowcharts, VO-synced explainers):
- Pause with `waitFor(seconds)` — `delay()` is a timing helper needing a
  duration + task callback, not a pause. Concurrency via
  `spawn(() => generator)` (+ `join`/`cancel`), not `fork()` from core.
- Instant updates (`.text()`, `.fill()`) return no `ThreadGenerator` — set
  them *outside/before* `yield* all(...)`, never inside.
- Scenes run sequentially on one timeline; if later stages "look missing" in
  preview, `Zoom to fit` (F) and drag the playhead past the first scene.
- Sequential `yield` vs concurrent `yield* all()` — choose deliberately.

**Godot** (real-time sims, HTML5/Wasm interactives): UI controls hijack keys —
set `focus_mode = 0`, filter via `_unhandled_input()`. Overkill for linear
animation; UI needs manual scene-tree work; not built for headless export.

**R3F / Three.js:** `rotation`/`position` go on `<mesh>`, not `<boxGeometry>`;
cursor via `document.body.style.cursor`. Standardize 6-digit hex (8-digit
alpha hex warns). Drei `<Text>` needs a native-font fallback or CDN failure
crashes the canvas. Heavy on mobile — optimize assets.

**Scrollytelling (MDX + GSAP/Framer):** target custom scrollers
(`scroller: '.scroll-container'`), not `window`. Escape raw `<` in MDX
(`&lt;` or code blocks) or the compiler breaks on "unclosed tags".

**React Flow** (node/edge diagrams): memoize and decouple node data from the
React render cycle or dragging drops below 60fps. Strictly 2D.

**Whisper:** use it for speech bounds + script QA (`speech_end` vs file
length); transcript-vs-checklist catches mislabeled act audio.

## 8. Which tool for which brief (from TOOL_TRADEOFFS.md)

- System design (microservices, shards, caches, gateways) → **Remotion** for
  video (HTML/Tailwind beats Manim coordinate math), **React Flow** for web.
- LeetCode / algorithms (BSTs, sorting, traversals) → **Motion Canvas** for
  video (generator stepping + VO sync), **Godot** for web (user-input sims).
- General math / proofs / LaTeX → **Manim** for video, **R3F** for 3D web.
- Scrollytelling / immersive docs → **GSAP/Framer in MDX** (+ R3F/Spline flair).
- Real-time sims / physics / state machines → **Godot**.
- Rule of thumb: Manim explains decisions, B-roll proves product; match
  portfolio claims to fact records (integrated ≠ trained, prototype ≠ production).

## 9. Agent workflow rules

1. Read order for a new video task: this file → `docs/video-production/00-QUICK-START.md`
   → `MANIM-AGENT-LESSONS.md` → the project's `projects/<name>.md` entry →
   that project's latest journal entry.
2. New project setup: follow `07-NEW-PROJECT-SETUP.md` — add
   `docs/video-production/projects/<name>.md` + `{project}/journal.md`, and a
   `.cursor/rules/<name>.mdc` once standards stabilize.
3. Plan in markdown (PLAY CHECKLIST / BEATS.md) before heavy codegen.
4. Layout scene before motion scene; one beat per file while iterating.
5. Render `-ql` portrait → extract frames → inspect PNGs yourself → fix →
   safe-zone overlay QA on mid+late frames → final → mux → `posted/`.
6. Keep 4K masters locally; upload 1080×1920 if size/compression bites.
7. Docs hygiene: decisions live in project `journal.md` + `05-LESSONS-LEARNED.md`,
   repo-wide process in `docs/video-production/`, never only in chat. New
   Manim footgun ⇒ row in `MANIM-AGENT-LESSONS.md` + one-liner in
   `05-LESSONS-LEARNED.md`. Fix stale act numbers in source + journal together.

## 10. Standing decisions (from the automation project, Oct 2026)

- **Code-generated visuals only — no AI video.** No Luma/Runway/Kling or
  text-to-video providers anywhere in the pipeline.
- **Engine split:** Manim CE + FFmpeg for mechanism diagrams; Remotion for
  titles/charts/captions; raw Canvas/WebGL for live sims; MoviePy + FFmpeg
  assembles to 1080×1920. Stock B-roll (Pexels/Pixabay, portrait) allowed as
  supplement — it is not AI video.
- **UI is chat + dashboard with BYOK.** User brings their own key/LLM; keys
  live in the browser, per-request, never stored server-side; Anthropic +
  OpenAI-compatible endpoints with a model picker.
- **The design harness is the moat:** reusable looks + the four-part script
  contract + caption/timing rules, so any LLM fills the same quality bar.

## 11. Known gaps (new agent: verify before relying on these)

- `learning/README.md` links a `voice-testing` folder under a
  `Manim-DSA-SD-Concepts` path that does not exist in this repo — treat as
  stale pointer, do not follow blindly.
- `generate_tts.py` lists three TTS models incl. `gemini-3.1-flash-tts-preview`;
  confirm availability before using non-default models.
- Posted shorts so far: `01-response-time`, `02-percentiles` (both Puck).
  Anything claiming more posted work must update `posted/README.md` first.

## 12. Rules that override everything

1. **VO-first for shorts, visual-first for long portfolio pieces.** Shorts:
   script → Puck → animate to audio. Long-form: ship with default waits,
   tune after VO. Know which project type you are in.
2. **Use `render_short.sh`; never bare `manim -qh`.** Bare `-qh` can land at
   60fps and in the wrong output folder. The helper locks `--fps 30` and the
   right `--resolution`.
3. **Portrait must be set in two places.** `config.frame_width = 9` /
   `config.frame_height = 16` in the scene module AND `--resolution H,W`
   (height,width — e.g. `480,854`). Quality flags override `manim.cfg`
   pixels; `-ql` alone gives landscape 854×480.
4. **Hold the last content frame — never extend black.** When VO outlasts
   video, `mux_vo.py` freeze-pads via `tpad=stop_mode=clone`. Never mux with
   `-shortest` alone (it would cut the narration), and strip fades/blank
   tails before holding. Act patterns: `wait → FadeOut` ⇒
   `content_end = duration − fade_run_time`; b-roll ending in blank ⇒ hold
   last b-roll frame, strip the tail.
5. **Keep readable content inside safe bounds.** Top 12%, bottom 24%, right
   18%, left 6% stay empty (platform chrome). Minimum type at phone-arm
   distance: title ≥30, body/punchline ≥20, brace/axis/line tags ≥18.
6. **API keys in repo-root `.env`, never in chat, never committed.**
   `GEMINI_API_KEY=` from https://aistudio.google.com/apikey. Rotate if exposed.
