# Context Summary: Automated Short-Form Science Video Pipeline

## 1. Base Prompt & User Intent
**Objective:** The user is designing a fully automated video generation pipeline for a hackathon project to recreate Instagram-style short-form science and computer science explainer Reels (e.g., @thestackframe, @kodekloud, @simulateitnow).
**Goal:** Provide this document to a research agent to evaluate implementation choices for generating audio, visual, and orchestration layers programmatically without UI-based tools.

## 2. Explainer Reel Core Elements
The target content relies on a strict Script ➔ Audio ➔ Visuals pipeline:
*   **Four-Part Scripting:** Hook (0-3s), Setup (3-15s), Mechanism (15-60s), and Payoff (Final 5-10s).
*   **Audio-First Syncing:** Visual elements are timed precisely to voiceover syllables, utilizing "easing" and "overlapping action."
*   **One Sharp Idea:** Each video isolates a single mechanism or paradox rather than summarizing broad disciplines.

## 3. Orchestration & Architecture
To automate this in a hackathon setting, a headless, multi-agent architecture is required. Recent real-world projects demonstrate that a multi-agent framework can successfully generate explanations, validate Manim code in a sandbox, and sync text-to-speech narration for animated storytelling.
*   **Orchestration Engine:** LangGraph manages state between research, scripting, and coding agents.
*   **Backend:** FastAPI exposes the trigger endpoints.
*   **Intelligence:** Claude 3.5 Sonnet generates the script, visual directives, and animation code. LLM agents can write Manim code, execute it in a sandbox environment, and debug their own mistakes.

## 4. Implementation Choices for Visual Generation

### Option A: Programmatic Math & Science Animations (Manim)
Best for abstract CS concepts (e.g., sorting algorithms, network protocols).
*   **Workflow:** A reasoning LLM outputs a scene description; a coding LLM translates this into a Python script using the Manim library.
*   **Execution:** The backend dispatches the script to an isolated, multi-stage Docker container where Manim and FFmpeg are pre-installed. The container runs the code, exports an `.mp4`, and terminates.
*   **Precedent:** Multi-agent architectures have successfully utilized RAG-based debugging to recover from Manim code generation failures.

### Option B: API-Driven Stock Retrieval
Best for scripts requiring real-world context (e.g., biology, nature, crowds).
*   **Workflow:** The agent analyzes the audio text to generate a specific 2-3 word search query.
*   **Execution:** A `GET` request is sent to the Pexels or Pixabay Video API with parameters `orientation=portrait` and `min_width=1080` to fetch mobile-optimized B-roll.

### Option C: Generative AI Video
Best for cinematic or photorealistic concepts (e.g., biological processes, sci-fi elements).
*   **Workflow:** The backend submits a text prompt via a `POST` request to providers like Luma (Ray 3.2), Runway (Gen-4.5), or Kling 3.0.
*   **Execution:** The system polls the provider or uses a webhook to download the generated clip once processing completes. The prompt must request a duration that covers the exact length of the voiceover segment.

## 5. Audio & Assembly Pipeline
*   **Voiceover:** The ElevenLabs API generates natural `.mp3` voiceovers.
*   **Timestamps:** The OpenAI Whisper API extracts exact word-level timestamps to determine scene durations. Beat-level text-to-speech synchronization is critical for aligning animation timing with the audio track.
*   **Assembly & Subtitles:** MoviePy and FFmpeg stitch the audio and visual clips sequentially, burning center-screen captions onto the video based on the Whisper timestamps, and resizing to a 1080x1920 aspect ratio.
