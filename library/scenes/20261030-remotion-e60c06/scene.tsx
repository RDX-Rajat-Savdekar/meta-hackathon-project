import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Title, Appear, theme, sec } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const LAP_X = 216;
  const SER_X = 864;
  const PATH_Y = 998;
  const GAP_X = 540;

  // travel: fast to gap, then stall
  const leadX = interpolate(frame, [sec(0.47), sec(1.09), sec(2.39)], [280, 632, 712], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const midX = interpolate(frame, [sec(0.47), sec(1.09), sec(2.39)], [280, GAP_X, 582], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const trailX = interpolate(frame, [sec(0.47), sec(1.09), sec(2.39)], [280, 448, 532], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const spawnOp = interpolate(frame, [sec(0.47), sec(0.47) + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const midVanish = interpolate(frame, [sec(1.09), sec(1.09) + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flashSize = interpolate(frame, [sec(1.09), sec(1.09) + 20], [24, 210], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flashOp = interpolate(frame, [sec(1.09), sec(1.09) + 20], [0.95, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const qRaw: number =
    frame < sec(2.39) ? 0 : spring({ frame: frame - sec(2.39), fps, config: { damping: 14 } });
  const qScale = interpolate(qRaw, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const laptopLift = interpolate(frame, [sec(3.89), sec(3.89) + 15], [0, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const laptopGlow = interpolate(frame, [sec(3.89), sec(3.89) + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const serverLift = interpolate(frame, [sec(4.59), sec(4.59) + 15], [0, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const serverGlow = interpolate(frame, [sec(4.59), sec(4.59) + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const reconnect = interpolate(frame, [sec(7.31), sec(7.31) + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const gapBlink = (Math.sin(frame / 8) + 1) / 2;
  const gapOp = interpolate(frame, [sec(1.09), sec(7.31)], [1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bob = Math.sin(frame / 12) * 7;
  const bob2 = Math.sin(frame / 10 + 1.3) * 6;
  const pathPulse = 0.28 + 0.14 * Math.sin(frame / 14);

  const cubeBase: React.CSSProperties = {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 12,
    background: theme.accent,
    border: "3px solid rgba(255,255,255,0.85)",
    boxShadow: `0 0 28px ${theme.accent}, 0 0 8px rgba(255,255,255,0.6)`,
  };

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      <Title text="PACKETS CAN VANISH" at={0} y={252} size={86} color={theme.fg} />

      {/* thin path at y-52% */}
      <div
        style={{
          position: "absolute",
          left: 316,
          width: 448,
          top: PATH_Y,
          height: 6,
          borderRadius: 3,
          background: theme.muted,
          opacity: pathPulse + 0.15,
        }}
      />
      {/* gap marker */}
      {frame >= sec(1.09) && frame < sec(7.31) + 4 ? (
        <div
          style={{
            position: "absolute",
            left: GAP_X - 26,
            top: PATH_Y - 26,
            width: 52,
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 56,
            color: theme.accent2,
            opacity: gapOp * (0.45 + 0.55 * gapBlink),
          }}
        >
          ×
        </div>
      ) : null}

      {/* dashed reconnect line */}
      <div
        style={{
          position: "absolute",
          left: 316,
          width: 448,
          top: PATH_Y - 34,
          height: 0,
          borderTop: `5px dashed ${theme.accent}`,
          opacity: reconnect,
          transform: `scaleX(${reconnect})`,
          transformOrigin: "left center",
          filter: `drop-shadow(0 0 12px ${theme.accent})`,
        }}
      />

      {/* LAPTOP node x-20% y-45% */}
      <div
        style={{
          position: "absolute",
          left: LAP_X - 125,
          top: 764 + laptopLift + bob2 * 0.3,
          width: 250,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 210,
            height: 136,
            borderRadius: 18,
            border: `6px solid ${theme.accent}`,
            background: "#0b1e26",
            boxShadow: `0 0 ${20 + laptopGlow * 50}px ${theme.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 1,
          }}
        >
          <div
            style={{
              width: 150,
              height: 8,
              borderRadius: 4,
              background: theme.accent,
              opacity: 0.9,
              boxShadow: `0 0 14px ${theme.accent}`,
            }}
          />
          <div style={{ position: "absolute", marginTop: -58, width: 60, height: 10, borderRadius: 5, background: theme.accent, opacity: 0.55 }} />
        </div>
        <div style={{ width: 250, height: 20, borderRadius: 8, background: "#1a2e38", border: `3px solid ${theme.accent}`, marginTop: -4 }} />
        <div
          style={{
            marginTop: 18,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 50,
            letterSpacing: 3,
            color: laptopGlow > 0.5 ? "#06121a" : theme.fg,
            background: laptopGlow > 0.5 ? theme.accent : "rgba(255,255,255,0.08)",
            padding: "8px 28px",
            borderRadius: 14,
            border: `3px solid ${theme.accent}`,
          }}
        >
          LAPTOP
        </div>
      </div>

      {/* SERVER rack x-80% y-45% */}
      <div
        style={{
          position: "absolute",
          left: SER_X - 115,
          top: 704 + serverLift - bob2 * 0.3,
          width: 230,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 200,
            height: 268,
            borderRadius: 20,
            border: `6px solid ${theme.accent2}`,
            background: "#220f24",
            boxShadow: `0 0 ${18 + serverGlow * 55}px ${theme.accent2}`,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            justifyContent: "center",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ height: 36, borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", paddingLeft: 12, gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: theme.accent2, boxShadow: `0 0 ${8 + serverGlow * 14 + gapBlink * 6}px ${theme.accent2}` }} />
              <div style={{ width: 90, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.35)" }} />
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 50,
            letterSpacing: 3,
            color: serverGlow > 0.5 ? "#1c071d" : theme.fg,
            background: serverGlow > 0.5 ? theme.accent2 : "rgba(255,255,255,0.08)",
            padding: "8px 28px",
            borderRadius: 14,
            border: `3px solid ${theme.accent2}`,
          }}
        >
          SERVER
        </div>
      </div>

      {/* flash at vanish */}
      {frame >= sec(1.09) ? (
        <div
          style={{
            position: "absolute",
            left: GAP_X - flashSize,
            top: PATH_Y - flashSize,
            width: flashSize * 2,
            height: flashSize * 2,
            borderRadius: flashSize,
            border: `8px solid ${theme.accent2}`,
            background: `radial-gradient(circle, ${theme.accent2} 0%, rgba(255,45,120,0.25) 55%, transparent 70%)`,
            opacity: flashOp,
          }}
        />
      ) : null}

      {/* three cubes */}
      <div style={{ ...cubeBase, left: leadX - 27, top: PATH_Y - 27 + bob, opacity: spawnOp }} />
      <div
        style={{
          ...cubeBase,
          left: midX - 27,
          top: PATH_Y - 27 + bob2,
          opacity: spawnOp * midVanish,
          transform: `scale(${Math.max(0.001, midVanish)})`,
        }}
      />
      <div style={{ ...cubeBase, left: trailX - 27, top: PATH_Y - 27 - bob * 0.7, opacity: spawnOp }} />

      {/* big question mark x-50% y-38% */}
      {frame >= sec(2.39) ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: 560,
            textAlign: "center",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 250,
            lineHeight: 1,
            color: "#FFFFFF",
            textShadow: "0 0 40px rgba(255,255,255,0.7), 0 10px 0 rgba(0,0,0,0.55)",
            transform: `scale(${Math.max(0.001, qScale)}) translateY(${bob * 0.6}px)`,
            opacity: qScale > 0.05 ? 1 : 0,
          }}
        >
          ?
        </div>
      ) : null}

      {/* bottom-center dashed pill y-62% */}
      <Appear at={sec(7.31)} dy={30} style={{ position: "absolute", top: 1152, width: "100%", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            border: `4px dashed ${theme.accent}`,
            borderRadius: 999,
            padding: "20px 54px",
            background: "rgba(0,0,0,0.72)",
            boxShadow: `0 0 30px ${theme.accent}`,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 56,
            letterSpacing: 2,
            color: "#FFFFFF",
          }}
        >
          NEED HANDSHAKE?
        </div>
      </Appear>
    </AbsoluteFill>
  );
}