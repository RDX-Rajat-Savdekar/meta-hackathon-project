import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, random } from "remotion";
import { theme, sec, Appear } from "@kit";

const MEM_CELLS = [
  { x: 690, y: 860 },
  { x: 790, y: 1010 },
  { x: 670, y: 1160 },
];

const VIRUSES = [
  { x: 510, y: 1005 },
  { x: 380, y: 905 },
  { x: 380, y: 1110 },
  { x: 240, y: 800 },
  { x: 240, y: 1210 },
  { x: 110, y: 1005 },
];

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const awake = interpolate(frame, [sec(2.12), sec(2.42)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const coated = interpolate(frame, [sec(3.7), sec(4.6)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shrivel = interpolate(frame, [sec(4.82), sec(5.32)], [1, 0.14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const virusFade = interpolate(frame, [sec(4.82) + 16, sec(5.55)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shieldRaw = frame - sec(4.82);
  const shieldSpring =
    frame < sec(4.82)
      ? 0
      : spring({ frame: shieldRaw, fps, config: { damping: 14 } });
  const shieldScale = 2.3 - 1.3 * shieldSpring;
  const shieldOp = interpolate(shieldRaw, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shieldGlow = 0.6 + 0.4 * Math.sin(frame * 0.12);

  const bannerRaw = frame - sec(0.24);
  const bannerSpring =
    frame < sec(0.24)
      ? 0
      : spring({ frame: bannerRaw, fps, config: { damping: 14 } });
  const bannerScale = 0.4 + 0.6 * bannerSpring;

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      {/* bloodstream wash */}
      <AbsoluteFill style={{ opacity: 1 }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const speed = 6 + i * 2;
          const baseX = (i * 260 + frame * speed) % 1300;
          const x = baseX - 150;
          const y = 650 + i * 140 + Math.sin(frame * 0.05 + i * 1.4) * 22;
          const r = 120 + (i % 3) * 50;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: r,
                height: r,
                borderRadius: "50%",
                background: i % 2 === 0 ? "#3a0d18" : "#221016",
                opacity: 0.85,
                filter: "blur(2px)",
              }}
            />
          );
        })}
        {/* flow streaks */}
        {[0, 1, 2].map((i) => {
          const y = 780 + i * 150;
          const op = 0.12 + 0.08 * Math.sin(frame * 0.15 + i * 2);
          return (
            <div
              key={`s${i}`}
              style={{
                position: "absolute",
                left: 0,
                top: y,
                width: 1080,
                height: 26,
                background: theme.accent,
                opacity: op,
                filter: "blur(18px)",
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* SAVED GAME checkpoint banner */}
      <Appear at={sec(0.24)} style={{ position: "absolute", top: 212, width: "100%", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${bannerScale})`,
          }}
        >
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 84,
              color: theme.good,
              background: "rgba(0,0,0,0.72)",
              border: `6px solid ${theme.good}`,
              borderRadius: 28,
              padding: "14px 44px",
              letterSpacing: 2,
              boxShadow: `0 0 40px ${theme.good}88`,
            }}
          >
            ✓ SAVED GAME
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: theme.mono,
              fontWeight: 800,
              fontSize: 42,
              color: theme.bg,
              background: theme.good,
              borderRadius: 14,
              padding: "4px 28px",
              letterSpacing: 6,
            }}
          >
            CHECKPOINT
          </div>
        </div>
      </Appear>

      {/* shockwave rings from memory cells */}
      {[0, 10].map((d, ri) => {
        const start = sec(2.12) + d;
        const rad = interpolate(frame, [start, start + 36], [30, 400], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const op = interpolate(frame, [start, start + 36], [0.95, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (frame < start) return null;
        return (
          <div
            key={ri}
            style={{
              position: "absolute",
              left: 730 - rad,
              top: 1010 - rad,
              width: rad * 2,
              height: rad * 2,
              borderRadius: "50%",
              border: `10px solid ${theme.good}`,
              opacity: op,
            }}
          />
        );
      })}

      {/* memory cells - dormant dim then awake bright */}
      {MEM_CELLS.map((c, i) => {
        if (frame < sec(0.24)) return null;
        const bob = Math.sin(frame * 0.09 + i * 1.9) * 16;
        const breathe = 1 + 0.06 * Math.sin(frame * 0.14 + i * 2.2);
        const dimOp = 0.5 + 0.15 * Math.sin(frame * 0.1 + i);
        const glowSize = 10 + awake * 55 + awake * 18 * Math.sin(frame * 0.25);
        return (
          <div key={i} style={{ position: "absolute", left: c.x - 85, top: c.y + bob - 85 }}>
            <div
              style={{
                width: 170,
                height: 170,
                borderRadius: "50%",
                background: awake > 0.5 ? theme.good : "#12351f",
                border: `10px solid ${awake > 0.5 ? "#eaffef" : theme.good}`,
                opacity: awake > 0.5 ? 1 : dimOp + 0.25,
                transform: `scale(${breathe * (0.95 + awake * 0.15)})`,
                boxShadow:
                  awake > 0.5
                    ? `0 0 ${glowSize}px ${theme.good}, 0 0 ${glowSize * 2}px ${theme.good}66`
                    : `0 0 18px ${theme.good}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.55)" }} />
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.55)" }} />
              </div>
            </div>
            {/* nucleus */}
            <div
              style={{
                position: "absolute",
                left: 55,
                top: 100,
                width: 60,
                height: 42,
                borderRadius: "50%",
                background: awake > 0.5 ? "#04401c" : "#0a2414",
                opacity: 0.9,
              }}
            />
            {/* sleeping Zzz before wake */}
            {frame < sec(2.12) && (
              <div
                style={{
                  position: "absolute",
                  left: 120 + Math.sin(frame * 0.1 + i) * 8,
                  top: -30 - ((frame * 1.2 + i * 20) % 30),
                  fontFamily: theme.font,
                  fontWeight: 900,
                  fontSize: 56,
                  color: theme.muted,
                  opacity: interpolate(frame, [sec(0.24), sec(2.0)], [1, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                z
              </div>
            )}
          </div>
        );
      })}

      {/* viruses - arrow formation rush from left */}
      {VIRUSES.map((v, i) => {
        const start = sec(0.74) + i * 2;
        const p = interpolate(frame, [start, start + 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (frame < start) return null;
        const ease = 1 - (1 - p) * (1 - p);
        const x = -260 + (v.x + 260) * ease;
        const bobY = Math.sin(frame * 0.2 + i * 1.3) * 10;
        const y = v.y + bobY * p;
        const spin = frame * 3 + i * 40;
        const pulse = 1 + 0.08 * Math.sin(frame * 0.3 + i);
        const col = coated > 0.5 ? "#d8d8d8" : theme.accent2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 60,
              top: y - 60,
              width: 120,
              height: 120,
              opacity: virusFade,
              transform: `scale(${pulse * shrivel})`,
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
              const ang = k * 45 + spin * 0.15;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    left: 46,
                    top: -8,
                    width: 28,
                    height: 44,
                    background: col,
                    borderRadius: 14,
                    transform: `rotate(${ang}deg) translateY(-6px)`,
                    transformOrigin: "14px 68px",
                  }}
                />
              );
            })}
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 10,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: frame >= sec(4.82) ? theme.muted : theme.accent2,
                border: `${6 + coated * 10}px solid ${coated > 0.4 ? theme.fg : "#7a0e2e"}`,
                boxShadow: coated > 0.4 ? `0 0 24px ${theme.fg}` : `0 0 28px ${theme.accent2}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 14, height: 18, borderRadius: 7, background: "black", opacity: 0.7 }} />
                <div style={{ width: 14, height: 18, borderRadius: 7, background: "black", opacity: 0.7 }} />
              </div>
            </div>
          </div>
        );
      })}

      {/* dense Y antibody flood flying left */}
      {Array.from({ length: 30 }).map((_, i) => {
        const target = VIRUSES[i % VIRUSES.length];
        const r1 = random(`ab-y-${i}`);
        const r2 = random(`ab-x-${i}`);
        const startX = 680 + r2 * 140;
        const startY = 860 + r1 * 340;
        const endX = target.x + (r1 - 0.5) * 70;
        const endY = target.y + (r2 - 0.5) * 70;
        const s = sec(3.26) + (i % 15) * 2;
        const p = interpolate(frame, [s, s + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (frame < s) return null;
        const x = startX + (endX - startX) * p;
        const y = startY + (endY - startY) * p + Math.sin(frame * 0.4 + i) * 8 * (1 - p);
        const op = interpolate(frame, [s, s + 4, sec(4.82) + 10, sec(5.3)], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const sc = 0.8 + r1 * 0.7;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 62 * sc,
              color: theme.fg,
              opacity: op,
              textShadow: `0 0 18px ${theme.accent}, 0 0 6px white`,
              transform: `rotate(${-18 + r2 * 36 + frame * 0.6 * (i % 2 === 0 ? 1 : -1)}deg)`,
            }}
          >
            Y
          </div>
        );
      })}

      {/* finale cyan shield + PROTECTED at 25% from top */}
      {frame >= sec(4.82) && (
        <div
          style={{
            position: "absolute",
            top: 480,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            opacity: shieldOp,
            transform: `scale(${shieldScale})`,
          }}
        >
          <div style={{ position: "relative", width: 600, height: 660 }}>
            <svg width={600} height={660} viewBox="0 0 600 660">
              <path
                d="M300 15 L525 105 V330 C525 490 420 590 300 645 C180 590 75 490 75 330 V105 Z"
                fill={theme.accent}
                stroke={theme.fg}
                strokeWidth={14}
              />
              <path
                d="M300 55 L485 125 V330 C485 460 400 545 300 590 C200 545 115 460 115 330 V125 Z"
                fill="none"
                stroke={theme.fg}
                strokeWidth={6}
                opacity={0.85}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 210,
                width: 600,
                textAlign: "center",
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 72,
                color: theme.fg,
                letterSpacing: 1,
                textShadow: "0 4px 0 rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ fontSize: 110, lineHeight: 1 }}>🛡</div>
              <div style={{ marginTop: 8 }}>PROTECTED</div>
              <div
                style={{
                  marginTop: 12,
                  display: "inline-block",
                  fontFamily: theme.mono,
                  fontSize: 38,
                  fontWeight: 800,
                  background: theme.bg,
                  color: theme.accent,
                  borderRadius: 12,
                  padding: "6px 26px",
                  boxShadow: `0 0 ${30 * shieldGlow}px ${theme.accent}`,
                }}
              >
                VIRUS BLOCKED
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}