import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../theme";
import { useSpringAt } from "./anim";

/** Big punchy headline that springs in at frame `at`, positioned in the upper safe area. */
export const Title: React.FC<{ text: string; at?: number; color?: string; size?: number; y?: number }> = ({
  text,
  at = 0,
  color = theme.fg,
  size = 96,
  y = 360,
}) => {
  const s = useSpringAt(at);
  return (
    <AbsoluteFill style={{ alignItems: "center", top: y, height: "auto" }}>
      <div
        style={{
          fontFamily: theme.font,
          fontWeight: 900,
          fontSize: size,
          color,
          textAlign: "center",
          lineHeight: 1.05,
          padding: "0 80px",
          transform: `scale(${0.6 + 0.4 * s})`,
          opacity: s,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
