import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, sec, Appear, Title } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beats: 0, 0.76, 1.46, 1.7
  const lineDraw = interpolate(frame, [sec(0.76), sec(0.76) + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineCyan = interpolate(frame, [sec(1.46), sec(1.46) + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const handOpacity = interpolate(frame, [sec(1.46), sec(1.46) + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const handGrow = interpolate(frame, [sec(1.7), sec(1.7) + 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flash = interpolate(frame, [sec(1.7), sec(1.7) + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flashDecay = interpolate(frame, [sec(1.7) + 6, sec(1.7) + 22], [1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const popRaw = spring({ frame: frame - sec(1.46), fps, config: { damping: 14 } });
  const pop = frame < sec(1.46) ? 0 : popRaw;
  const wobble = 1 + 0.06 * Math.sin(frame * 0.35);
  const handScale = Math.max(0.001, pop * (1 + 0.5 * handGrow) * (frame > sec(1.7) ? wobble : 1));

  const pulse = (Math.sin(frame * 0.4) + 1) / 2;
  const greyOpacity = lineDraw * (0.55 + 0.4 * pulse);
  const flashAmt = flash * (1 - flashDecay * 0 + flashDecay) * 1;

  // traveling packet dot between nodes after 0.76s
  const loop = frame < sec(0.76) ? 0 : (frame - sec(0.76)) % 18 / 18;
  const dotX = interpolate(loop, [0, 1], [0, 540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotOpacity = interpolate(frame, [sec(0.76), sec(0.76) + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const centerY = 960;
  const nodeD = 220;

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Title text="CAN'T TALK?" at={sec(0)} color={theme.fg} size={102} y={340} />

      {/* dashed track base */}
      <div
        style={{
          position: "absolute",
          left: 270,
          top: centerY - 5,
          width: 540,
          height: 10,
          transform: `scaleX(${lineDraw})`,
          transformOrigin: "left center",
          opacity: greyOpacity,
          borderTop: `9px dashed ${theme.muted}`,
        }}
      />
      {/* bright cyan overlay after shakes */}
      <div
        style={{
          position: "absolute",
          left: 270,
          top: centerY - 5,
          width: 540,
          height: 10,
          transform: `scaleX(${lineDraw})`,
          transformOrigin: "left center",
          opacity: lineCyan,
          borderTop: `9px dashed ${theme.accent}`,
          filter: `drop-shadow(0 0 18px ${theme.accent})`,
        }}
      />
      {/* moving packet dot to keep line alive */}
      <div
        style={{
          position: "absolute",
          left: 270 + dotX - 11,
          top: centerY - 11,
          width: 22,
          height: 22,
          borderRadius: 11,
          background: lineCyan > 0.5 ? theme.accent : theme.accent3,
          boxShadow: `0 0 ${18 + 18 * pulse}px ${lineCyan > 0.5 ? theme.accent : theme.accent3}`,
          opacity: dotOpacity * lineDraw,
        }}
      />

      {/* LEFT LAPTOP NODE */}
      <Appear at={sec(0)} dy={40} style={{ position: "absolute", left: 160, top: 830, width: 220, alignItems: "center" }}>
        <div
          style={{
            width: nodeD,
            height: nodeD,
            borderRadius: nodeD / 2,
            background: "#0B1B3A",
            border: `6px solid ${theme.accent}`,
            boxShadow: `0 0 ${34 + 24 * pulse + 70 * flashAmt}px ${theme.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 92,
          }}
        >
          💻
        </div>
        <div
          style={{
            marginTop: 18,
            width: "100%",
            textAlign: "center",
            color: theme.accent,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 50,
            letterSpacing: 2,
          }}
        >
          LAPTOP
        </div>
      </Appear>

      {/* RIGHT SERVER NODE */}
      <Appear at={sec(0)} dy={40} style={{ position: "absolute", left: 700, top: 830, width: 220, alignItems: "center" }}>
        <div
          style={{
            width: nodeD,
            height: nodeD,
            borderRadius: nodeD / 2,
            background: "#2A0E2E",
            border: `6px solid ${theme.accent2}`,
            boxShadow: `0 0 ${34 + 24 * (1 - pulse) + 70 * flashAmt}px ${theme.accent2}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 92,
          }}
        >
          🖥️
        </div>
        <div
          style={{
            marginTop: 18,
            width: "100%",
            textAlign: "center",
            color: theme.accent2,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 50,
            letterSpacing: 2,
          }}
        >
          SERVER
        </div>
      </Appear>

      {/* CENTER HANDSHAKE */}
      <div
        style={{
          position: "absolute",
          left: 540 - 90,
          top: centerY - 90,
          width: 180,
          height: 180,
          borderRadius: 90,
          background: theme.accent3,
          border: "6px solid #fff",
          boxShadow: `0 0 ${30 + 30 * pulse + 60 * handGrow}px ${theme.accent3}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 96,
          opacity: handOpacity,
          transform: `scale(${handScale})`,
        }}
      >
        🤝
      </div>
    </AbsoluteFill>
  );
}