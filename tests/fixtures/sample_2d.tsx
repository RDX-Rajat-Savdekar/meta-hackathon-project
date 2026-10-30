import React from "react";
import { AbsoluteFill } from "remotion";
import { ArrayBars, CodeBlock, Title, Appear, theme, sec } from "@kit";

export default function Scene() {
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Title text="Quicksort: pick a pivot" at={0} />
      <AbsoluteFill style={{ top: 620, height: "auto", alignItems: "center" }}>
        <ArrayBars
          values={[7, 2, 9, 4, 5, 1]}
          steps={[
            { at: sec(0.8), order: [0, 1, 2, 3, 4, 5], pivot: 4 },
            { at: sec(2), order: [1, 3, 5, 4, 0, 2], pivot: 4, highlight: [1, 3, 5] },
          ]}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1380, height: "auto", alignItems: "center" }}>
        <Appear at={sec(2.6)}>
          <CodeBlock code={"left  = [x < p]\nright = [x > p]"} fontSize={36} width={760} />
        </Appear>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
