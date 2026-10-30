import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme, sec, ramp, Title } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fSplit = sec(0.54);
  const fFreeze = sec(0.72);
  const fShield = sec(1.32);

  const singlePop = spring({ frame, fps, config: { damping: 14 } });
  const splitSpring = spring({ frame: Math.max(0, frame - fSplit), fps, config: { damping: 14 } });
  const shieldSpring = spring({ frame: Math.max(0, frame - fShield), fps, config: { damping: 14 } });

  const eff = frame < fFreeze ? frame : fFreeze;

  const freezeMix = interpolate(frame, [fFreeze, fFreeze + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const singleHide = ramp(frame, fSplit, 7);
  const singlePulse = 1 + 0.14 * Math.sin(eff * 0.5);
  const singleScale = Math.max(0, singlePop * (1 - singleHide) * singlePulse);
  const singleJX = Math.sin(eff * 0.65) * 22;
  const singleJY = Math.cos(eff * 0.78) * 22;

  const freezeRingOp = interpolate(frame, [fFreeze, fFreeze + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const freezeRingScale = interpolate(frame, [fFreeze, fFreeze + 12], [0.72, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shieldOffsetY = (1 - shieldSpring) * -1150;
  const shieldOp = interpolate(frame, [fShield, fShield + 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shockProg = interpolate(frame, [fShield + 5, fShield + 17], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shockOp = interpolate(frame, [fShield + 5, fShield + 18], [0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lockFlash = interpolate(frame, [fShield + 6, fShield + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glowPulse = 0.75 + 0.25 * Math.sin(frame * 0.42);

  const CX = 540;
  const CY = 864;
  const slots = [
    { dx: -155, dy: -95 },
    { dx: 155, dy: -95 },
    { dx: -140, dy: 135 },
    { dx: 150, dy: 135 },
  ];

  const spikeAngles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const renderVirus = (size: number, color: string) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {spikeAngles.map((i) => {
        const a = (i * Math.PI * 2) / 12;
        const x1 = 50 + Math.cos(a) * 28;
        const y1 = 50 + Math.sin(a) * 28;
        const x2 = 50 + Math.cos(a) * 42;
        const y2 = 50 + Math.sin(a) * 42;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={6} strokeLinecap="round" />
            <circle cx={x2} cy={y2} r={6.5} fill={color} />
          </g>
        );
      })}
      <circle cx={50} cy={50} r={29} fill={color} />
      <circle cx={40} cy={42} r={7} fill="rgba(0,0,0,0.35)" />
      <circle cx={58} cy={55} r={5} fill="rgba(0,0,0,0.32)" />
      <circle cx={49} cy={62} r={4} fill="rgba(255,255,255,0.35)" />
    </svg>
  );

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      <Title text="LOSE WITHOUT GETTING SICK?" at={0} color={theme.fg} size={92} y={340} />

      {/* single virus before split */}
      {frame < fSplit + 8 && (
        <div
          style={{
            position: "absolute",
            left: CX - 105 + singleJX,
            top: CY - 105 + singleJY,
            width: 210,
            height: 210,
            transform: `scale(${Math.max(0.001, singleScale)})`,
            opacity: interpolate(frame, [sec(0), sec(0.2)], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            filter: `drop-shadow(0 0 34px ${theme.accent2}) saturate(${1 - freezeMix * 0.4})`,
          }}
        >
          {renderVirus(210, theme.accent2)}
        </div>
      )}

      {/* 4 copies after split */}
      {frame >= fSplit &&
        slots.map((s, i) => {
          const jx = Math.sin(eff * 0.65 + i * 1.9) * 24;
          const jy = Math.cos(eff * 0.78 + i * 2.4) * 24;
          const pulse = 1 + 0.13 * Math.sin(eff * 0.52 + i * 1.3);
          const sc = Math.max(0.001, splitSpring * pulse * 0.98);
          const op = 1 - freezeMix * 0.28;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: CX + s.dx - 105 + jx,
                top: CY + s.dy - 105 + jy,
                width: 210,
                height: 210,
                transform: `scale(${sc}) rotate(${eff * 9 + i * 28}deg)`,
                opacity: op,
                filter: `drop-shadow(0 0 30px ${theme.accent2}) saturate(${1 - freezeMix * 0.45}) brightness(${1 - freezeMix * 0.12})`,
              }}
            >
              {renderVirus(210, theme.accent2)}
            </div>
          );
        })}

      {/* freeze-frame ring */}
      {frame >= fFreeze && (
        <div
          style={{
            position: "absolute",
            left: CX - 360,
            top: CY - 310,
            width: 720,
            height: 620,
            borderRadius: 360,
            border: `10px solid ${theme.accent3}`,
            opacity: freezeRingOp * 0.95,
            transform: `scale(${freezeRingScale})`,
            boxShadow: `0 0 44px ${theme.accent3}`,
          }}
        />
      )}
      {frame >= fFreeze && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 1240,
            width: "100%",
            textAlign: "center",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 52,
            letterSpacing: 8,
            color: theme.accent3,
            opacity: freezeRingOp,
          }}
        >
          FROZEN
        </div>
      )}

      {/* shockwave */}
      {frame >= fShield && (
        <div
          style={{
            position: "absolute",
            left: CX - 360,
            top: CY - 310,
            width: 720,
            height: 620,
            borderRadius: 360,
            border: `14px solid ${theme.accent}`,
            opacity: shockOp,
            transform: `scale(${0.5 + shockProg * 1.1})`,
            boxShadow: `0 0 70px ${theme.accent}`,
          }}
        />
      )}

      {/* shield slam */}
      {frame >= fShield && (
        <div
          style={{
            position: "absolute",
            left: CX - 270,
            top: CY - 310 + shieldOffsetY,
            width: 540,
            height: 620,
            opacity: shieldOp,
            filter: `drop-shadow(0 0 ${50 + glowPulse * 45}px ${theme.accent})`,
          }}
        >
          <svg width={540} height={620} viewBox="0 0 540 620">
            <path
              d="M270 18 L460 95 L460 285 C460 440 368 532 270 592 C172 532 80 440 80 285 L80 95 Z"
              fill="rgba(0,229,255,0.22)"
              stroke={theme.accent}
              strokeWidth={20}
              strokeLinejoin="round"
            />
            <path
              d="M270 55 L420 115 L420 285 C420 410 345 485 270 535 C195 485 120 410 120 285 L120 115 Z"
              fill={theme.accent}
              opacity={0.92}
            />
            <g>
              <path d="M215 250 L215 215 C215 165 325 165 325 215 L325 250" fill="none" stroke="#04202a" strokeWidth={20} strokeLinecap="round" />
              <rect x={195} y={245} width={150} height={120} rx={22} fill="#04202a" />
              <circle cx={270} cy={295} r={18} fill="white" />
              <rect x={262} y={295} width={16} height={38} rx={8} fill="white" />
            </g>
            <circle cx={270} cy={295} r={18} fill="white" opacity={lockFlash} />
          </svg>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 400,
              width: "100%",
              textAlign: "center",
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 64,
              color: "#04202a",
            }}
          >
            PROTECTED
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}