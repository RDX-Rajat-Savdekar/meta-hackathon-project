import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, sec, ramp, Appear, useSpringAt } from "@kit";

const F_WASH = sec(0.2);
const F_SLOW = sec(1.12);
const F_VIRUS = sec(2.68);
const F_DAY = sec(3.82);
const F_ANTI = sec(4.88);
const F_M1 = sec(7.06);
const F_M2 = sec(7.28);
const F_M3 = sec(7.6);
const F_M4 = sec(7.98);

function SpikyVirus({
  frame,
  x,
  y,
  size,
  appear,
  phase,
}: {
  frame: number;
  x: number;
  y: number;
  size: number;
  appear: number;
  phase: number;
}) {
  const op = ramp(frame, appear, 10);
  if (op <= 0) return null;
  const pulse = 1 + 0.18 * Math.sin(frame * 0.35 + phase);
  const bounce = 14 * Math.sin(frame * 0.25 + phase * 2.1);
  const spikes: number[] = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + bounce,
        width: size,
        height: size,
        opacity: op,
        transform: `scale(${pulse})`,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {spikes.map((a) => {
          const rad = (a * Math.PI) / 180;
          const x1 = 50 + Math.cos(rad) * 26;
          const y1 = 50 + Math.sin(rad) * 26;
          const x2 = 50 + Math.cos(rad) * 44;
          const y2 = 50 + Math.sin(rad) * 44;
          return (
            <line
              key={a}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={theme.accent2}
              strokeWidth={9}
              strokeLinecap="round"
            />
          );
        })}
        <circle cx={50} cy={50} r={30} fill={theme.accent2} />
        <circle cx={41} cy={41} r={9} fill="#ffffff" opacity={0.55} />
      </svg>
    </div>
  );
}

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;
  const pillPop = useSpringAt(sec(0.2));
  const badgePop = useSpringAt(sec(1.12));

  const wash = ramp(frame, F_WASH, 18);

  // slow-motion time warp: fast before 1.12s, crawl after
  const tEff = frame < F_SLOW ? frame : F_SLOW + (frame - F_SLOW) * 0.18;

  const cells = [
    { bx: 90, by: 800, d: 260, ph: 0 },
    { bx: 400, by: 930, d: 300, ph: 1.7 },
    { bx: 660, by: 810, d: 240, ph: 3.1 },
    { bx: 270, by: 1060, d: 220, ph: 4.5 },
  ];

  // DAY 1 -> DAY 4 tick
  let dayNum = 1;
  if (frame >= F_DAY) {
    dayNum = Math.min(4, 1 + Math.floor((frame - F_DAY) / 8));
  }
  const dayOp = ramp(frame, F_WASH, 12);
  const tickPhase = frame >= F_DAY ? (frame - F_DAY) % 8 : 99;
  const tickPop = interpolate(tickPhase, [0, 4, 8], [1.25, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // clock badge fade out after days tick
  const badgeFade = interpolate(frame, [sec(3.5), sec(3.9)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgePulse = 1 + 0.07 * Math.sin(frame * 0.3);

  // antibody assembly, very slow dot-by-dot
  const tipA = interpolate(frame, [F_ANTI, sec(5.3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tipB = interpolate(frame, [sec(5.3), sec(5.9)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tipC = interpolate(frame, [sec(5.9), sec(6.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const armA = interpolate(frame, [sec(5.6), sec(6.1)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const armB = interpolate(frame, [sec(6.1), sec(6.6)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const armC = interpolate(frame, [sec(6.6), sec(7.1)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const antiBob = 8 * Math.sin(frame * 0.18);

  const viruses: { x: number; y: number; s: number; at: number; ph: number }[] = [
    { x: 720, y: 850, s: 74, at: F_VIRUS, ph: 0 },
    { x: 845, y: 900, s: 66, at: F_M1, ph: 1.2 },
    { x: 670, y: 975, s: 62, at: F_M2, ph: 2.1 },
    { x: 865, y: 775, s: 68, at: F_M2, ph: 3.3 },
    { x: 625, y: 850, s: 58, at: F_M3, ph: 0.7 },
    { x: 905, y: 975, s: 60, at: F_M3, ph: 1.9 },
    { x: 755, y: 1045, s: 64, at: F_M3, ph: 2.8 },
    { x: 915, y: 855, s: 56, at: F_M3, ph: 4.0 },
    { x: 600, y: 740, s: 54, at: F_M4, ph: 0.4 },
    { x: 700, y: 740, s: 52, at: F_M4, ph: 1.1 },
    { x: 800, y: 735, s: 54, at: F_M4, ph: 1.8 },
    { x: 905, y: 695, s: 52, at: F_M4, ph: 2.5 },
    { x: 600, y: 1040, s: 55, at: F_M4, ph: 3.0 },
    { x: 695, y: 1115, s: 53, at: F_M4, ph: 3.7 },
    { x: 830, y: 1115, s: 56, at: F_M4, ph: 4.4 },
    { x: 945, y: 1065, s: 54, at: F_M4, ph: 5.1 },
  ];

  const flowX = (off: number) => ((tEff * 6 + off) % 1350) - 160;

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      {/* vessel wash band 15%-70% */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 288,
          height: 1056,
          background: theme.muted,
          opacity: wash * 0.42,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 288,
          height: 14,
          background: theme.fg,
          opacity: wash * 0.25,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1330,
          height: 14,
          background: theme.fg,
          opacity: wash * 0.25,
        }}
      />
      {/* flow streaks */}
      {[380, 700, 1020, 1220].map((yy, i) => (
        <div
          key={yy}
          style={{
            position: "absolute",
            top: yy,
            left: flowX(i * 340),
            width: 260,
            height: 22,
            borderRadius: 999,
            background: theme.fg,
            opacity: wash * 0.14,
          }}
        />
      ))}

      {/* 4 large blood cells drifting slow crawl */}
      {cells.map((c, i) => {
        const op = ramp(frame, F_WASH + i * 6, 16);
        const dx = 52 * Math.sin(tEff * 0.04 + c.ph);
        const dy = 16 * Math.sin(tEff * 0.05 + c.ph * 1.3);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.bx + dx,
              top: c.by + dy,
              width: c.d,
              height: c.d,
              borderRadius: "50%",
              background: theme.fg,
              opacity: op * 0.94,
              boxShadow: "0 0 70px rgba(255,255,255,0.35)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: c.d * 0.18,
                top: c.d * 0.16,
                width: c.d * 0.34,
                height: c.d * 0.34,
                borderRadius: "50%",
                background: "#ffffff",
                opacity: 0.9,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: c.d * 0.32,
                top: c.d * 0.34,
                width: c.d * 0.36,
                height: c.d * 0.36,
                borderRadius: "50%",
                background: theme.muted,
                opacity: 0.35,
              }}
            />
          </div>
        );
      })}

      {/* DAY pill top-center at 15% */}
      <Appear
        at={F_WASH}
        style={{ position: "absolute", top: 258, width: "100%", alignItems: "center" }}
      >
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: "#15151e",
              border: `4px solid ${theme.fg}`,
              borderRadius: 999,
              padding: "18px 60px",
              display: "flex",
              alignItems: "center",
              gap: 28,
              opacity: dayOp,
              transform: `scale(${0.6 + pillPop * 0.4 * tickPop})`,
              boxShadow: "0 10px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                color: theme.fg,
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 64,
                letterSpacing: 3,
              }}
            >
              {`DAY ${dayNum}`}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[1, 2, 3, 4].map((d) => (
                <div
                  key={d}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: d <= dayNum ? theme.accent3 : "transparent",
                    border: `3px solid ${theme.fg}`,
                    opacity: d <= dayNum ? 1 : 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Appear>

      {/* slow-mo clock badge over cells */}
      <Appear
        at={F_SLOW}
        style={{ position: "absolute", top: 620, width: "100%", alignItems: "center" }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            opacity: badgeFade,
          }}
        >
          <div
            style={{
              background: "rgba(10,10,16,0.78)",
              border: `3px solid ${theme.accent}`,
              borderRadius: 999,
              padding: "14px 36px",
              display: "flex",
              alignItems: "center",
              gap: 18,
              transform: `scale(${(0.5 + badgePop * 0.5) * badgePulse})`,
            }}
          >
            <div style={{ fontSize: 56, color: theme.accent }}>◷</div>
            <div
              style={{
                color: theme.fg,
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 50,
                letterSpacing: 2,
              }}
            >
              SLOW-MO
            </div>
          </div>
        </div>
      </Appear>

      {/* viruses right-center doubling 1-2-4-8-16 */}
      {viruses.map((v, i) => (
        <SpikyVirus
          key={i}
          frame={frame}
          x={v.x}
          y={v.y}
          size={v.s}
          appear={v.at}
          phase={v.ph}
        />
      ))}

      {/* Y antibody assembling below center */}
      <div
        style={{
          position: "absolute",
          top: 1160 + antiBob,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <svg viewBox="0 0 120 130" width={150} height={162}>
          <line
            x1={60}
            y1={62}
            x2={26}
            y2={24}
            stroke={theme.fg}
            strokeWidth={11}
            strokeLinecap="round"
            opacity={armA}
          />
          <line
            x1={60}
            y1={62}
            x2={94}
            y2={24}
            stroke={theme.fg}
            strokeWidth={11}
            strokeLinecap="round"
            opacity={armB}
          />
          <line
            x1={60}
            y1={62}
            x2={60}
            y2={108}
            stroke={theme.fg}
            strokeWidth={11}
            strokeLinecap="round"
            opacity={armC}
          />
          <circle cx={60} cy={62} r={11} fill={theme.fg} opacity={tipA} />
          <circle cx={26} cy={24} r={13} fill={theme.fg} opacity={tipA} />
          <circle cx={94} cy={24} r={13} fill={theme.fg} opacity={tipB} />
          <circle cx={60} cy={108} r={13} fill={theme.fg} opacity={tipC} />
        </svg>
      </div>
    </AbsoluteFill>
  );
}