// Shared house style. Mirrored in reelgen/render/manim_renderer.py (THEME).
export const theme = {
  width: 1080,
  height: 1920,
  fps: 30,
  bg: "#0B0F19",
  fg: "#F5F7FA",
  muted: "#8A93A6",
  accent: "#4CC9F0",
  accent2: "#F72585",
  accent3: "#FFD166",
  good: "#06D6A0",
  font: "'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
  mono: "'SF Mono', Menlo, monospace",
  // Keep content inside: top 10% and bottom 25% are reserved for captions / IG UI.
  safeTop: 192,
  safeBottom: 1440,
} as const;
