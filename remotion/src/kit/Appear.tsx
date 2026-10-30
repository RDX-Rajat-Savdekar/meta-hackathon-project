import React from "react";
import { useCurrentFrame } from "remotion";
import { ramp } from "./anim";

/** Fades + slides children in at frame `at`. Optionally fades out at `outAt`. */
export const Appear: React.FC<{
  at: number;
  outAt?: number;
  dy?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, outAt, dy = 40, style, children }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, at, 12);
  const out = outAt === undefined ? 0 : ramp(frame, outAt, 10);
  return (
    <div style={{ opacity: p * (1 - out), transform: `translateY(${(1 - p) * dy}px)`, ...style }}>
      {children}
    </div>
  );
};
