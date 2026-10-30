import React from "react";
import { AbsoluteFill } from "remotion";
import { Scene3D, Molecule3D, Title, theme, sec } from "@kit";

export default function Scene() {
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Scene3D orbit={0.8}>
        <Molecule3D
          atoms={[
            { pos: [0, 0, 0], color: "#F72585", r: 0.7, at: 0 },
            { pos: [1.4, 1.0, 0], color: "#F5F7FA", at: sec(0.5) },
            { pos: [-1.4, 1.0, 0], color: "#F5F7FA", at: sec(0.8) },
          ]}
          bonds={[[0, 1, sec(0.6)], [0, 2, sec(0.9)]]}
        />
      </Scene3D>
      <Title text="H₂O in 3D" at={0} y={260} />
    </AbsoluteFill>
  );
}
