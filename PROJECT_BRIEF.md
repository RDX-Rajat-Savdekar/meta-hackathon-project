# Project Brief: Automated Short-Form Science Video Pipeline
> Hand this file to Claude and ask it to make an implementation plan.
> Repo: https://github.com/RDX-Rajat-Savdekar/meta-hackathon-project (public)

## The ask for Claude
Make a decision-complete implementation plan for the project described below.
Present the plan inline for review; do not write code yet.

## 1. What we are building
A fully automated, headless pipeline that generates Instagram-style short-form
science / computer-science explainer Reels (20–60s, 1080x1920). Reference
accounts for the target look: @thestackframe (character-driven CS explainers),
@kodekloud (DevOps doodle explainers), @simulateitnow (agent-based crowd /
game-theory simulations), @s4.codes (numbered clean-code series),
@trending.repos / OpenReels (agent-generated GitHub-trending reels).
Built for the Meta Global AI Developer Hackathon ($1M prizes, indie track).

## 2. Explainer reel format (strict)
- Script ➔ Audio ➔ Visuals pipeline, audio-first: visuals timed to voiceover
  syllables with easing and overlapping action.
- Four-part script: Hook (0-3s), Setup (3-15s), Mechanism (15-60s),
  Payoff (final 5-10s).
- One sharp idea per video: a single mechanism or paradox, never a broad summary.

## 3. Hard decisions (do not revisit without asking)
- **Code-generated visuals only. No AI-generated video.** No Luma / Runway /
  Kling or any text-to-video provider.
- **Rendering engines:** Manim CE + FFmpeg for mechanism diagrams (3Blue1Brown
  style); Remotion (React) for titles, charts, captions, layout-heavy scenes;
  raw Canvas/WebGL/Three.js for live simulations (the @simulateitnow approach);
  Motion Canvas, HyperFrames, headless Chromium, and Lottie are approved
  alternatives. MoviePy + FFmpeg assembles everything to 1080x1920 MP4.
- **Stock B-roll (Pexels/Pixabay API, portrait, min_width=1080) is allowed** as
  an optional supplement for real-world topics — it is not AI video.
- **UI is chat + dashboard hybrid with BYOK:** the user brings their own API
  key / LLM (keys live in the browser only, sent per-request, never stored
  server-side; support Anthropic + OpenAI-compatible endpoints with a model
  picker). Chat triggers runs; dashboard shows per-stage progress and artifacts
  with per-stage retry.
- **"Design harness" is the moat:** a library of reusable looks (Manim 3B1B
  style, chalkboard, Swiss poster, kinetic type) plus the four-part script
  contract and caption/timing rules. The LLM fills the harness; the harness
  guarantees output quality regardless of which model the user brings.

## 4. Architecture
- Headless multi-agent backend: LangGraph manages state between research,
  scripting, and coding agents; FastAPI exposes trigger endpoints.
- Agents write Manim code, execute it in an isolated Docker container
  (Manim + FFmpeg pre-installed), export `.mp4`, and debug their own failures
  (RAG-based debugging precedent exists).
- Audio: ElevenLabs API for `.mp3` voiceover; OpenAI Whisper for word-level
  timestamps that drive scene durations and center-screen captions.

## 5. Repo state
- Public GitHub repo, branch `main`, currently contains `MUSE_GUIDE.md`,
  `GEMINI.md` (earlier pipeline notes), and this file. Greenfield: no backend
  or frontend code exists yet.
- Verification plan (agreed, not yet run): audio trial → stock-B-roll trial →
  Manim-in-Docker trial → MoviePy assembly trial.

## 6. What the plan must cover
1. Backend scaffolding order (FastAPI endpoints, LangGraph stage graph, BYOK
   passthrough, Manim Docker job runner).
2. Frontend scaffolding order (chat view, dashboard stage cards, key/model
   management, artifact previews).
3. The design-harness shape: how looks, script contracts, and timing rules are
   represented so any LLM can fill them.
4. Validation per work unit (runnable checks, not prose).
5. What to defer for the hackathon deadline.
