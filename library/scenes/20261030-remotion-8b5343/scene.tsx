import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme, sec, Title, Appear, useSpringAt } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const ticketPop = useSpringAt(0, 14);
  const popA = useSpringAt(2, 14);
  const popB = useSpringAt(4, 14);

  const F_SLAM = sec(1.26);
  const F_GLOW = sec(0.44);
  const F_SPLIT = sec(1.74);

  // hover bob (always moving)
  const bobA = Math.sin(frame * 0.18) * 12;
  const bobB = Math.sin(frame * 0.18 + Math.PI) * 12;

  // slam 0->1 starting exactly at beat
  const slamP = interpolate(frame, [F_SLAM, F_SLAM + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // pre-slam jitter envelope
  const jitterEnv =
    interpolate(frame, [F_GLOW, F_GLOW + 5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [F_SLAM, F_SLAM + 5], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const jitterA = Math.sin(frame * 1.15) * 14 * jitterEnv;
  const jitterB = Math.sin(frame * 1.15 + Math.PI) * 14 * jitterEnv;

  // glow intensity starts at buyers beat
  const glow = interpolate(frame, [F_GLOW, F_GLOW + 6], [0.35, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flick = 0.85 + 0.15 * Math.sin(frame * 0.7);

  const hoverTop = 678;
  const slamTop = 928;
  const topA = (1 - slamP) * (hoverTop + bobA) + slamP * slamTop;
  const topB = (1 - slamP) * (hoverTop + bobB) + slamP * slamTop;

  // screen shake from slam + split
  const gate1 = interpolate(frame, [F_SLAM, F_SLAM + 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const decay1 = interpolate(frame, [F_SLAM, F_SLAM + 20], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gate2 = interpolate(frame, [F_SPLIT, F_SPLIT + 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const decay2 = interpolate(frame, [F_SPLIT, F_SPLIT + 16], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shakeX =
    gate1 * decay1 * Math.sin(frame * 1.9) * 26 + gate2 * decay2 * Math.sin(frame * 2.7) * 18;
  const shakeY =
    gate1 * decay1 * Math.cos(frame * 2.3) * 22 + gate2 * decay2 * Math.cos(frame * 3.1) * 16;

  // impact flashes
  const flash1 = interpolate(frame, [F_SLAM, F_SLAM + 1, F_SLAM + 10], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flash2 = interpolate(frame, [F_SPLIT, F_SPLIT + 1, F_SPLIT + 9], [0, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // split
  const splitP = interpolate(frame, [F_SPLIT, F_SPLIT + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const singleOp = interpolate(frame, [F_SPLIT, F_SPLIT + 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const doubleOp = interpolate(frame, [F_SPLIT, F_SPLIT + 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glitchEnv =
    interpolate(frame, [F_SPLIT, F_SPLIT + 2], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [F_SPLIT + 8, F_SPLIT + 18], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const glitchX = glitchEnv * Math.sin(frame * 3.1) * 28;

  const ticketScale = 0.4 + 0.6 * ticketPop;
  const scaleA = 0.3 + 0.7 * popA;
  const scaleB = 0.3 + 0.7 * popB;

  const prog1 = interpolate(frame, [F_SLAM, F_SLAM + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const prog2 = interpolate(frame, [F_SPLIT, F_SPLIT + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sparks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
        <Title text="LAST SEAT x2?" at={0} color={theme.fg} size={108} y={330} />

        <Appear
          at={sec(0.7)}
          style={{ position: "absolute", top: 505, width: "100%", textAlign: "center" }}
        >
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 800,
              fontSize: 52,
              color: theme.muted,
              letterSpacing: 2,
            }}
          >
            2 BUYERS : 1 SEAT
          </div>
        </Appear>

        {/* SINGLE TICKET */}
        <div
          style={{
            position: "absolute",
            left: 260,
            top: 896,
            width: 560,
            height: 320,
            opacity: singleOp,
            transform: `translate(${glitchX}px, 0px) scale(${ticketScale})`,
          }}
        >
          {/* rgb ghosts */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: theme.accent,
              borderRadius: 36,
              transform: `translate(${-22 * glitchEnv - 8}px, 0px)`,
              opacity: 0.65 * glitchEnv + 0.12,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: theme.accent2,
              borderRadius: 36,
              transform: `translate(${22 * glitchEnv + 8}px, 0px)`,
              opacity: 0.65 * glitchEnv + 0.12,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: theme.accent3,
              borderRadius: 36,
              boxShadow: `0 0 ${50 + 50 * flick * glow}px ${theme.accent3}88, 0 18px 50px rgba(0,0,0,0.55)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 84,
                color: "#1a1500",
                lineHeight: 1,
              }}
            >
              1 SEAT
            </div>
            <div
              style={{
                marginTop: 14,
                width: 420,
                borderTop: "6px dashed rgba(0,0,0,0.55)",
              }}
            />
            <div
              style={{
                marginTop: 12,
                fontFamily: theme.mono,
                fontWeight: 800,
                fontSize: 48,
                color: "#1a1500",
                letterSpacing: 6,
              }}
            >
              ADMIT ONE
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: -28,
              top: 126,
              width: 56,
              height: 68,
              borderRadius: 34,
              background: theme.bg,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -28,
              top: 126,
              width: 56,
              height: 68,
              borderRadius: 34,
              background: theme.bg,
            }}
          />
        </div>

        {/* SPLIT DOUBLE TICKETS */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1080,
            height: 1920,
            opacity: doubleOp,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 250,
              top: 870,
              width: 520,
              height: 300,
              background: theme.accent3,
              borderRadius: 32,
              transform: `translate(${-62 * splitP}px, ${-34 * splitP}px) rotate(${-9 * splitP}deg)`,
              boxShadow: `-10px 0 0 ${theme.accent}, 0 0 70px ${theme.accent}aa`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 72, color: "#1a1500" }}>
              1 SEAT
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 310,
              top: 950,
              width: 520,
              height: 300,
              background: theme.accent3,
              borderRadius: 32,
              transform: `translate(${62 * splitP}px, ${34 * splitP}px) rotate(${9 * splitP}deg)`,
              boxShadow: `10px 0 0 ${theme.accent2}, 0 0 70px ${theme.accent2}aa`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 72, color: "#1a1500" }}>
              1 SEAT
            </div>
          </div>
        </div>

        {/* SPARK BURST 1 */}
        {sparks.map((i) => {
          const ang = i * ((Math.PI * 2) / 12) + 0.3;
          const d = prog1 * 300;
          const sz = 20 * (1 - prog1) + 7;
          const x = 540 + Math.cos(ang) * d;
          const y = 1056 + Math.sin(ang) * d * 0.72;
          const col = i % 3 === 0 ? theme.accent : i % 3 === 1 ? theme.accent2 : "#ffffff";
          return (
            <div
              key={`a${i}`}
              style={{
                position: "absolute",
                left: x - sz / 2,
                top: y - sz / 2,
                width: sz,
                height: sz,
                borderRadius: sz / 2,
                background: col,
                opacity: gate1 * (1 - prog1),
                boxShadow: `0 0 18px ${col}`,
              }}
            />
          );
        })}
        {/* SPARK BURST 2 */}
        {sparks.map((i) => {
          const ang = i * ((Math.PI * 2) / 12) + 0.9;
          const d = prog2 * 340;
          const sz = 22 * (1 - prog2) + 6;
          const x = 540 + Math.cos(ang) * d;
          const y = 1060 + Math.sin(ang) * d * 0.75;
          const col = i % 3 === 0 ? theme.accent3 : i % 3 === 1 ? theme.accent : theme.accent2;
          return (
            <div
              key={`b${i}`}
              style={{
                position: "absolute",
                left: x - sz / 2,
                top: y - sz / 2,
                width: sz,
                height: sz / 2.4,
                borderRadius: 8,
                background: col,
                opacity: gate2 * (1 - prog2),
                boxShadow: `0 0 22px ${col}`,
                transform: `rotate(${ang}rad)`,
              }}
            />
          );
        })}

        {/* BUY A */}
        <div
          style={{
            position: "absolute",
            left: 110 + jitterA,
            top: topA,
            width: 330,
            height: 108,
            transform: `scale(${scaleA})`,
            opacity: popA,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 999,
              background: theme.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 60,
              color: "#002830",
              boxShadow: `0 0 ${Math.round(24 + 70 * glow * flick)}px ${theme.accent}, 0 10px 30px rgba(0,0,0,0.5)`,
              border: "6px solid #ffffff",
            }}
          >
            BUY A
          </div>
        </div>

        {/* BUY B */}
        <div
          style={{
            position: "absolute",
            left: 640 + jitterB,
            top: topB,
            width: 330,
            height: 108,
            transform: `scale(${scaleB})`,
            opacity: popB,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 999,
              background: theme.accent2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 60,
              color: "#ffffff",
              boxShadow: `0 0 ${Math.round(24 + 70 * glow * flick)}px ${theme.accent2}, 0 10px 30px rgba(0,0,0,0.5)`,
              border: "6px solid #ffffff",
            }}
          >
            BUY B
          </div>
        </div>

        <Appear
          at={sec(1.74)}
          style={{ position: "absolute", top: 1300, width: "100%", textAlign: "center" }}
        >
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 74,
              color: theme.accent3,
              textShadow: `0 0 30px ${theme.accent3}`,
              letterSpacing: 1,
            }}
          >
            DOUBLE-BOOKED!
          </div>
        </Appear>
      </AbsoluteFill>

      {/* impact flashes */}
      <AbsoluteFill style={{ background: "#ffffff", opacity: flash1, pointerEvents: "none" }} />
      <AbsoluteFill
        style={{ background: theme.accent3, opacity: flash2 * 0.6, pointerEvents: "none" }}
      />
    </AbsoluteFill>
  );
}