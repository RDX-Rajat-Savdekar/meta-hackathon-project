import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ramp } from "./anim";

/** Inline text whose background marker sweeps in at frame `at`. */
export const Highlight: React.FC<{ at: number; color?: string; children: React.ReactNode }> = ({
  at,
  color = theme.accent2,
  children,
}) => {
  const p = ramp(useCurrentFrame(), at, 10);
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${color}, ${color})`,
        backgroundSize: `${p * 100}% 100%`,
        backgroundRepeat: "no-repeat",
        padding: "0 8px",
        borderRadius: 8,
      }}
    >
      {children}
    </span>
  );
};
