import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ramp } from "./anim";

/**
 * Code panel. Line i appears at revealAt[i] (frames; defaults to all at 0).
 * `highlight` = {line, from, to?}[] draws an accent bar on a line during [from, to).
 */
export const CodeBlock: React.FC<{
  code: string;
  revealAt?: number[];
  highlight?: { line: number; from: number; to?: number }[];
  fontSize?: number;
  width?: number;
}> = ({ code, revealAt, highlight = [], fontSize = 40, width = 940 }) => {
  const frame = useCurrentFrame();
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div
      style={{
        width,
        background: "#141A2A",
        borderRadius: 28,
        padding: 40,
        fontFamily: theme.mono,
        fontSize,
        color: theme.fg,
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
      }}
    >
      {lines.map((ln, i) => {
        const at = revealAt?.[i] ?? 0;
        const p = ramp(frame, at, 8);
        const hl = highlight.some((h) => h.line === i && frame >= h.from && (h.to === undefined || frame < h.to));
        return (
          <div
            key={i}
            style={{
              opacity: p,
              whiteSpace: "pre",
              padding: "4px 12px",
              borderRadius: 10,
              background: hl ? "rgba(76,201,240,0.22)" : "transparent",
              borderLeft: `6px solid ${hl ? theme.accent : "transparent"}`,
            }}
          >
            {ln || " "}
          </div>
        );
      })}
    </div>
  );
};
