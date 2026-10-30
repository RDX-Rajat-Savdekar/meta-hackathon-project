import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 linear ramp between frames `from` and `from + dur`. */
export const ramp = (frame: number, from: number, dur = 15) =>
  interpolate(frame, [from, from + dur], [0, 1], clamp);

/** 0→1 spring starting at frame `from`. */
export const useSpringAt = (from: number, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - from, fps, config: { damping } });
};

/** Seconds → frames at 30fps. */
export const sec = (t: number) => Math.round(t * 30);
