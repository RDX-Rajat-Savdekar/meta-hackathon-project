import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

import { Appear, Title, theme } from "@kit";

type Props = { title: string; keywords: { text: string; at: number }[] };

/** Deterministic, LLM-free scene used when generated code fails every attempt. */
const Fallback: React.FC<Props> = ({ title, keywords }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${40 + Math.sin(frame / 40) * 5}%, #1B2340, ${theme.bg})` }}>
      <Title text={title} y={300} size={88} color={theme.accent} />
      <AbsoluteFill style={{ top: 700, height: "auto", alignItems: "center", gap: 36 }}>
        {keywords.map((k, i) => (
          <Appear key={i} at={k.at}>
            <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: 72, color: i % 2 ? theme.accent3 : theme.fg }}>{k.text}</div>
          </Appear>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Fallback;
