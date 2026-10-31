import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, sec, ramp, useSpringAt } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const d0 = useSpringAt(sec(0.33), 14);
  const d1 = useSpringAt(sec(0.33) + 4, 14);
  const d2 = useSpringAt(sec(0.33) + 8, 14);
  const sZero = useSpringAt(sec(1.65), 14);
  const sCheck = useSpringAt(sec(4.21), 14);

  const morph = ramp(frame, sec(2.91), 18);
  const tubeH = interpolate(morph, [0, 1], [10, 78], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashedOp = interpolate(morph, [0, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sweepP = interpolate(frame, [sec(2.91), sec(2.91) + 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweepX = interpolate(sweepP, [0, 1], [-190, 900], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweepOp = interpolate(frame, [sec(2.91) + 28, sec(2.91) + 40], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pulse = (Math.sin(frame * 0.15) + 1) / 2;
  const floatY = Math.sin((frame / fps) * Math.PI * 2 * 0.6) * 7;

  const flowStart = sec(3.45);
  const delta = Math.max(0, frame - flowStart) * 9;
  const blockOp = ramp(frame, sec(3.45), 12);

  const zeroOp = interpolate(sZero, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zeroRot = interpolate(Math.min(1, Math.max(0, sZero)), [0, 1], [-10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const checkOp = interpolate(sCheck, [0, 0.35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nums = [101, 102, 103, 104, 105];

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      {/* ambient stage glow */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 700,
          width: 900,
          height: 560,
          borderRadius: 280,
          background: `radial-gradient(ellipse at center, ${theme.accent}33 0%, transparent 68%)`,
          opacity: 0.35 + morph * 0.55 + pulse * 0.1,
        }}
      />

      {/* three dots above tube */}
      <div
        style={{
          position: "absolute",
          top: 560 + floatY,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 34,
        }}
      >
        {[d0, d1, d2].map((s, i) => (
          <div
            key={i}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: theme.accent,
              boxShadow: `0 0 18px ${theme.accent}, 0 0 52px ${theme.accent}99`,
              opacity: s <= 0.01 ? 0 : 1,
              transform: `scale(${Math.max(0.001, s)})`,
            }}
          />
        ))}
      </div>

      {/* ZERO DATA pill */}
      <div
        style={{
          position: "absolute",
          top: 660,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: theme.fg,
            color: "#0B0F14",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 54,
            letterSpacing: 3,
            padding: "18px 52px",
            borderRadius: 100,
            boxShadow: `0 0 30px #ffffff55, 0 10px 40px rgba(0,0,0,0.5)`,
            opacity: zeroOp,
            transform: `scale(${Math.max(0.001, sZero)}) rotate(${zeroRot}deg)`,
          }}
        >
          ZERO DATA
        </div>
      </div>

      {/* dashed thin line */}
      <div
        style={{
          position: "absolute",
          left: 162,
          top: 957,
          width: 756,
          height: 8,
          borderTop: `8px dashed ${theme.muted}`,
          opacity: dashedOp * 0.95 + 0.05 * ((Math.sin(frame * 0.2) + 1) / 2),
        }}
      />

      {/* outer glow behind solid tube */}
      <div
        style={{
          position: "absolute",
          left: 142,
          top: 960,
          width: 796,
          height: tubeH + 44,
          transform: "translateY(-50%)",
          borderRadius: 60,
          backgroundColor: theme.accent,
          filter: "blur(46px)",
          opacity: morph * (0.35 + pulse * 0.25),
        }}
      />

      {/* solid glowing tube */}
      <div
        style={{
          position: "absolute",
          left: 162,
          top: 960,
          width: 756,
          height: Math.max(2, tubeH),
          transform: "translateY(-50%)",
          borderRadius: 40,
          backgroundColor: theme.accent,
          boxShadow: `0 0 24px ${theme.accent}, 0 0 90px ${theme.accent}AA, inset 0 8px 18px #ffffff88, inset 0 -10px 20px rgba(0,0,0,0.35)`,
          opacity: morph,
          overflow: "hidden",
        }}
      >
        {/* inner core highlight */}
        <div
          style={{
            position: "absolute",
            left: 18,
            right: 18,
            top: 10,
            height: 14,
            borderRadius: 8,
            backgroundColor: "#ffffff",
            opacity: 0.55 * morph,
          }}
        />
        {/* light sweep */}
        <div
          style={{
            position: "absolute",
            top: -10,
            left: sweepX,
            width: 130,
            height: tubeH + 40,
            background: "linear-gradient(100deg, transparent 0%, #ffffffEE 50%, transparent 100%)",
            transform: "skewX(-16deg)",
            opacity: morph * sweepOp,
            filter: "blur(2px)",
          }}
        />
        {/* flowing numbered blocks */}
        {nums.map((n, i) => {
          const pos = ((i * 196 + delta) % 980) - 110;
          return (
            <div
              key={n}
              style={{
                position: "absolute",
                left: pos,
                top: "50%",
                transform: "translateY(-50%)",
                width: 122,
                height: 54,
                borderRadius: 13,
                backgroundColor: "#FFFFFF",
                border: "3px solid rgba(0,0,0,0.22)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: blockOp,
              }}
            >
              <span
                style={{
                  fontFamily: theme.font,
                  fontWeight: 900,
                  fontSize: 38,
                  color: theme.accent3,
                  textShadow: "0 1px 0 rgba(0,0,0,0.7)",
                  lineHeight: 1,
                }}
              >
                {n}
              </span>
            </div>
          );
        })}
      </div>

      {/* tube end caps */}
      <div
        style={{
          position: "absolute",
          left: 132,
          top: 960,
          width: 34,
          height: 34,
          borderRadius: 17,
          transform: "translateY(-50%)",
          backgroundColor: morph > 0.5 ? theme.accent : theme.muted,
          boxShadow: morph > 0.5 ? `0 0 20px ${theme.accent}` : "none",
          opacity: 0.4 + morph * 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 914,
          top: 960,
          width: 34,
          height: 34,
          borderRadius: 17,
          transform: "translateY(-50%)",
          backgroundColor: morph > 0.5 ? theme.accent : theme.muted,
          boxShadow: morph > 0.5 ? `0 0 20px ${theme.accent}` : "none",
          opacity: 0.4 + morph * 0.6,
        }}
      />

      {/* check badge + NOTHING LOST */}
      <div
        style={{
          position: "absolute",
          top: 1085,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 106,
            height: 106,
            borderRadius: 53,
            backgroundColor: theme.good,
            boxShadow: `0 0 26px ${theme.good}, 0 0 80px ${theme.good}88`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 66,
            fontWeight: 900,
            fontFamily: theme.font,
            opacity: checkOp,
            transform: `scale(${Math.max(0.001, sCheck)})`,
          }}
        >
          ✓
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 84,
            letterSpacing: 4,
            color: theme.good,
            textShadow: `0 0 28px ${theme.good}88`,
            opacity: checkOp,
            transform: `scale(${Math.max(0.001, 0.6 + sCheck * 0.4)})`,
            textAlign: "center",
          }}
        >
          NOTHING LOST
        </div>
      </div>
    </AbsoluteFill>
  );
}