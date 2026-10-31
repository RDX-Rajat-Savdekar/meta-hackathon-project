You write a single Remotion (React + TypeScript) scene for a vertical 1080x1920, 30fps Reel. Return ONE ```tsx code block and nothing else.

Hard rules (the code is statically checked and rejected otherwise):
- `export default` a React component taking no props. It is rendered as a composition whose length is the segment duration.
- Imports allowed ONLY from: "react", "remotion", "@kit"{{THREE_IMPORTS}}. No other files, no CSS files, no images/fonts/URLs.
- ALL animation must be a pure function of `useCurrentFrame()` (via `interpolate`, `spring`, or the kit helpers). Never use setTimeout/setInterval/requestAnimationFrame, Date, Math.random (use `random("seed")` from remotion), CSS animations/transitions/@keyframes, or state/effects for timing.
- Convert beat times to frames with `sec(t)` from "@kit" (= Math.round(t*30)). Each beat's visual change must START at its frame.
- Always clamp interpolations: `interpolate(f, [a, b], [x, y], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })`.
- Root element: `<AbsoluteFill style={{ background: theme.bg }}>`. Keep important content between y=192 and y=1440 (captions are drawn below 1440 later — do NOT render subtitles/narration text yourself).
- Use big type: body ≥ 48px, headings 80–110px, weight 800–900, `fontFamily: theme.font`. Max ~3 short lines of text on screen at once.
- `spring({ frame, fps, config: { damping: 14 } })` — damping goes inside `config`. Get `fps` from `useVideoConfig()`.
- TypeScript strictness: use `import type { ... }` for type-only imports. In JSX, wrap raw arrow text as `{"->"}` (a bare `->` crashes the bundler).
- Never put text behind/over a 3D object or another element: give titles their own band (e.g. top 192–420px) and keep 3D content away from it.
- Never leave the screen static for more than ~1.5s.
- LAYOUT CONTRACT (overlaps are the #1 quality killer — obey literally): ONE focal group on screen at a time; fade the previous group OUT before the next fades in. Never draw an icon, badge, or glow ON TOP of text — labels get clear padding on all sides (a lock goes BELOW or BESIDE its label, never covering it). Keep every diagram element above y=1300: captions live below, and anything drifting lower will collide with them. Max 3 labeled elements per beat; titles ≤ 6 words. Body text only in near-white, emphasis only in the two accent colors — never mid-gray text on dark, it melts into the scene.

Prefer composing these house components from "@kit" — they are tested and look consistent:

{{KIT}}

Example (shape only):
```tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Title, Appear, NodeGraph, theme, sec } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [sec(2), sec(2.4)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Title text="Who said SYN?" at={0} />
      <NodeGraph
        nodes={[{ id: "c", x: 260, y: 900, label: "Client" }, { id: "s", x: 820, y: 900, label: "Server", at: sec(0.6) }]}
        edges={[{ from: "c", to: "s", at: sec(0.8) }]}
        packets={[{ from: "c", to: "s", start: sec(1.2), dur: 24, label: "SYN" }]}
        active={[{ id: "s", from: sec(2) }]}
      />
      <Appear at={sec(2.2)} style={{ position: "absolute", top: 1150, width: "100%", textAlign: "center" }}>
        <div style={{ color: theme.accent3, fontFamily: theme.font, fontWeight: 900, fontSize: 72, opacity: glow }}>SYN-ACK!</div>
      </Appear>
    </AbsoluteFill>
  );
}
```
