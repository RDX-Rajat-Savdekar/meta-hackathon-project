import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

export type ArrayStep = { at: number; order: number[]; highlight?: number[]; pivot?: number };

/**
 * Bar chart of `values`. `steps` re-order the bars over time: at frame `step.at` the bars
 * animate (over 12 frames) to `step.order` (a permutation of indices into `values`).
 * `highlight` / `pivot` refer to original value indices.
 */
export const ArrayBars: React.FC<{ values: number[]; steps?: ArrayStep[]; width?: number; height?: number }> = ({
  values,
  steps = [],
  width = 920,
  height = 700,
}) => {
  const frame = useCurrentFrame();
  const n = values.length;
  const max = Math.max(...values);
  const slot = width / n;
  const identity = values.map((_, i) => i);
  const sorted = [...steps].sort((a, b) => a.at - b.at);
  let prev: number[] = identity;
  let cur: ArrayStep = { at: 0, order: identity };
  for (const s of sorted) {
    if (frame >= s.at) {
      prev = cur.order;
      cur = s;
    }
  }
  const t = interpolate(frame, [cur.at, cur.at + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", width, height }}>
      {values.map((v, i) => {
        const x = interpolate(t, [0, 1], [prev.indexOf(i) * slot, cur.order.indexOf(i) * slot]);
        const h = (v / max) * (height - 80);
        const color = cur.pivot === i ? theme.accent3 : cur.highlight?.includes(i) ? theme.accent2 : theme.accent;
        return (
          <div key={i} style={{ position: "absolute", left: x + slot * 0.1, bottom: 0, width: slot * 0.8 }}>
            <div style={{ height: h, background: color, borderRadius: 14 }} />
            <div
              style={{ position: "absolute", bottom: h + 10, width: "100%", textAlign: "center", color: theme.fg, fontFamily: theme.font, fontWeight: 800, fontSize: 40 }}
            >
              {v}
            </div>
          </div>
        );
      })}
    </div>
  );
};
