import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, sec, Appear, Highlight } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tubeP = spring({ frame: Math.max(0, frame - sec(0.39)), fps, config: { damping: 14 } });
  const tubeScaleX = interpolate(tubeP, [0, 1], [0.001, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const thinOpacity = interpolate(frame, [sec(0.39) - 2, sec(0.39) + 3], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const thickOpacity = interpolate(frame, [sec(0.39), sec(0.39) + 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const floatY = Math.sin(frame * 0.07) * 8;
  const glow = 0.35 + 0.25 * Math.sin(frame * 0.12);

  // Ghost packet flies in and bounces off shield at 1.59
  const ghostOpacity = interpolate(frame, [sec(1.0), sec(1.15), sec(2.0), sec(2.35)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ghostX = interpolate(frame, [sec(1.0), sec(1.59), sec(1.95)], [-160, 118, -60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ghostY = interpolate(frame, [sec(1.0), sec(1.59), sec(1.95)], [380, 775, 380], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ghostRot = interpolate(frame, [sec(1.0), sec(1.59), sec(1.95)], [-18, 8, -28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const rippleS = interpolate(frame, [sec(1.59), sec(2.05)], [0.4, 1.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rippleO = interpolate(frame, [sec(1.59), sec(2.05)], [0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Counters pulse at 2.61
  const counterScale = interpolate(frame, [sec(2.61), sec(2.86), sec(3.18)], [1, 1.42, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Blocks 1-2-3 flow 4.41 -> freeze at 5.49
  const effFrame = frame < sec(5.49) ? frame : sec(5.49);
  const convoy = interpolate(effFrame, [sec(4.41), sec(5.49)], [-200, 380], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blocksOpacity = interpolate(frame, [sec(4.41), sec(4.41) + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const pop = spring({ frame: Math.max(0, frame - sec(5.49)), fps, config: { damping: 14 } });
  const popScale = interpolate(pop, [0, 1], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const shieldOpacity = interpolate(frame, [sec(0.39), sec(0.39) + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      {/* thin wire before stable tube */}
      <div
        style={{
          position: "absolute",
          left: 280,
          top: 860,
          width: 520,
          height: 8,
          background: theme.muted,
          opacity: thinOpacity,
          borderRadius: 4,
        }}
      />

      {/* thick good=green stable tube at 45% height */}
      <div
        style={{
          position: "absolute",
          left: 280,
          top: 830,
          width: 520,
          height: 68,
          background: theme.good,
          borderRadius: 34,
          opacity: thickOpacity,
          transform: `scaleX(${tubeScaleX})`,
          transformOrigin: "left center",
          boxShadow: `0 0 ${30 + glow * 30}px ${theme.good}`,
        }}
      />
      {/* tube inner highlight + blocks mask */}
      <div
        style={{
          position: "absolute",
          left: 280,
          top: 830,
          width: 520,
          height: 68,
          borderRadius: 34,
          overflow: "hidden",
          opacity: thickOpacity,
          transform: `scaleX(${tubeScaleX})`,
          transformOrigin: "left center",
          background: "rgba(255,255,255,0.08)",
        }}
      >
        {[0, 1, 2].map((i) => {
          const bx = convoy - i * 98;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: bx,
                top: 5,
                width: 58,
                height: 58,
                borderRadius: 14,
                background: "#fff",
                opacity: blocksOpacity,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0b1220",
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 38,
                boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {/* LEFT NODE : LAPTOP */}
      <div style={{ position: "absolute", left: 90, top: 779 + floatY, width: 210, textAlign: "center" }}>
        <div
          style={{
            width: 170,
            height: 170,
            margin: "0 auto",
            borderRadius: 85,
            background: "#1b2638",
            border: `5px solid ${theme.fg}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 76,
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          💻
        </div>
        <div style={{ marginTop: 12, color: theme.fg, fontFamily: theme.font, fontWeight: 800, fontSize: 48, letterSpacing: 2 }}>
          LAPTOP
        </div>
      </div>

      {/* RIGHT NODE : SERVER */}
      <div style={{ position: "absolute", left: 780, top: 779 - floatY, width: 210, textAlign: "center" }}>
        <div
          style={{
            width: 170,
            height: 170,
            margin: "0 auto",
            borderRadius: 85,
            background: "#1b2638",
            border: `5px solid ${theme.fg}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 76,
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          🗄️
        </div>
        <div style={{ marginTop: 12, color: theme.fg, fontFamily: theme.font, fontWeight: 800, fontSize: 48, letterSpacing: 2 }}>
          SERVER
        </div>
      </div>

      {/* locked green counter badges above nodes */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 640,
          width: 170,
          height: 72,
          borderRadius: 36,
          background: theme.good,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#07120a",
          fontFamily: theme.font,
          fontWeight: 900,
          fontSize: 48,
          transform: `scale(${counterScale})`,
          boxShadow: `0 0 24px ${theme.good}`,
        }}
      >
        43 🔒
      </div>
      <div
        style={{
          position: "absolute",
          left: 800,
          top: 640,
          width: 170,
          height: 72,
          borderRadius: 36,
          background: theme.good,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#07120a",
          fontFamily: theme.font,
          fontWeight: 900,
          fontSize: 48,
          transform: `scale(${counterScale})`,
          boxShadow: `0 0 24px ${theme.good}`,
        }}
      >
        101 🔒
      </div>

      {/* translucent shield arc at tube entrance */}
      <div
        style={{
          position: "absolute",
          left: 228,
          top: 792,
          width: 118,
          height: 146,
          opacity: shieldOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 110,
            height: 130,
            borderRadius: 60,
            background: "rgba(0,229,255,0.22)",
            border: `6px solid ${theme.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 62,
            boxShadow: `0 0 26px ${theme.accent}`,
          }}
        >
          🛡️
        </div>
      </div>

      {/* impact ripple at shield */}
      <div
        style={{
          position: "absolute",
          left: 208,
          top: 788,
          width: 150,
          height: 150,
          borderRadius: 75,
          border: `7px solid ${theme.accent}`,
          opacity: rippleO,
          transform: `scale(${rippleS})`,
        }}
      />

      {/* grey ghost packet with red outline bouncing off */}
      <div
        style={{
          position: "absolute",
          left: ghostX,
          top: ghostY,
          width: 118,
          height: 88,
          borderRadius: 18,
          background: "#9aa0aa",
          border: "5px solid #ff2d2d",
          opacity: ghostOpacity,
          transform: `rotate(${ghostRot}deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          fontFamily: theme.font,
          fontWeight: 900,
          color: "#2b2f36",
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        }}
      >
        👻
      </div>

      {/* Final bold text at 60% height */}
      <Appear at={sec(5.49)} dy={40} style={{ position: "absolute", top: 1080, width: "100%", textAlign: "center" }}>
        <div style={{ transform: `scale(${popScale})` }}>
          <div style={{ color: "#fff", fontFamily: theme.font, fontWeight: 900, fontSize: 86, lineHeight: 1.1 }}>
            No <Highlight at={sec(5.49)} color={theme.accent3}>handshake,</Highlight>
          </div>
          <div style={{ color: "#fff", fontFamily: theme.font, fontWeight: 900, fontSize: 86, lineHeight: 1.1 }}>
            no reliable internet
          </div>
        </div>
      </Appear>
    </AbsoluteFill>
  );
}