import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ramp } from "./anim";

export type GNode = { id: string; x: number; y: number; label?: string; at?: number };
export type GEdge = { from: string; to: string; at?: number };
export type Packet = { from: string; to: string; start: number; dur?: number; color?: string; label?: string };

/**
 * Nodes + edges in a 1080x1920 coordinate space (use y between 300 and 1500).
 * Each node/edge fades in at its `at` frame. `active` = [{id, from, to?}] glows a node.
 * `packets` travel along from→to between frames start and start+dur.
 */
export const NodeGraph: React.FC<{
  nodes: GNode[];
  edges?: GEdge[];
  active?: { id: string; from: number; to?: number }[];
  packets?: Packet[];
  radius?: number;
}> = ({ nodes, edges = [], active = [], packets = [], radius = 70 }) => {
  const frame = useCurrentFrame();
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {edges.map((e, i) => {
        const a = byId[e.from];
        const b = byId[e.to];
        if (!a || !b) return null;
        const p = ramp(frame, e.at ?? 0, 12);
        return (
          <line key={i} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * p} y2={a.y + (b.y - a.y) * p} stroke={theme.muted} strokeWidth={8} strokeLinecap="round" />
        );
      })}
      {nodes.map((n) => {
        const p = ramp(frame, n.at ?? 0, 10);
        const on = active.some((a) => a.id === n.id && frame >= a.from && (a.to === undefined || frame < a.to));
        return (
          <g key={n.id} opacity={p} transform={`translate(${n.x} ${n.y}) scale(${0.5 + 0.5 * p})`}>
            <circle r={radius} fill={on ? theme.accent2 : "#1C2438"} stroke={on ? theme.accent3 : theme.accent} strokeWidth={8} />
            <text textAnchor="middle" dy={16} fill={theme.fg} fontFamily={theme.font} fontWeight={800} fontSize={44}>
              {n.label ?? n.id}
            </text>
          </g>
        );
      })}
      {packets.map((pk, i) => {
        const a = byId[pk.from];
        const b = byId[pk.to];
        const dur = pk.dur ?? 20;
        if (!a || !b || frame < pk.start || frame > pk.start + dur) return null;
        const t = ramp(frame, pk.start, dur);
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        return (
          <g key={`p${i}`} transform={`translate(${x} ${y})`}>
            <rect x={-46} y={-30} width={92} height={60} rx={14} fill={pk.color ?? theme.accent3} />
            {pk.label && (
              <text textAnchor="middle" dy={12} fontFamily={theme.font} fontWeight={900} fontSize={30} fill="#111">
                {pk.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
