import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, random } from "remotion";
import { theme, sec, Appear } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const awake = interpolate(frame, [sec(2.12), sec(2.52)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dissolve = interpolate(frame, [sec(4.82), sec(5.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const virusFade = interpolate(frame, [sec(5.15), sec(5.85)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bannerScale = spring({ frame: Math.max(0, frame - sec(0.24)), fps, config: { damping: 14 } });
  const shieldPop = spring({ frame: Math.max(0, frame - sec(4.82)), fps, config: { damping: 14 } });
  const shieldGlow = 0.65 + 0.35 * Math.sin(frame / 9);

  const cells = [
    { x: 670, y: 830, s: 150 },
    { x: 810, y: 975, s: 170 },
    { x: 690, y: 1115, s: 140 },
  ];
  const viruses = [
    { x: 480, y: 950 },
    { x: 335, y: 845 },
    { x: 335, y: 1055 },
    { x: 195, y: 745 },
    { x: 195, y: 1155 },
    { x: 105, y: 950 },
  ];

  const wave1 = interpolate(frame, [sec(2.12), sec(3.1)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wave2 = interpolate(frame, [sec(2.34), sec(3.32)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      {/* bloodstream wash */}
      <AbsoluteFill style={{ opacity: 0.5 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const rx = random(`bgx-${i}`) * 1080;
          const ry = 500 + random(`bgy-${i}`) * 900;
          const drift = Math.sin(frame / 28 + i * 1.3) * 60;
          const sz = 180 + random(`bgs-${i}`) * 260;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: rx - sz / 2 + drift,
                top: ry - sz / 2 + Math.cos(frame / 34 + i) * 40,
                width: sz,
                height: sz,
                borderRadius: "50%",
                background: i % 2 === 0 ? "#3a0d1a" : "#101d3a",
                opacity: 0.55,
                filter: "blur(2px)",
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* SAVED GAME checkpoint banner */}
      <Appear at={sec(0.24)} outAt={sec(4.4)} style={{ position: "absolute", top: 212, width: "100%", alignItems: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              transform: `scale(${bannerScale})`,
              background: theme.accent3,
              color: "#111",
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 64,
              letterSpacing: 2,
              padding: "18px 44px",
              borderRadius: 22,
              border: "6px solid #fff",
              boxShadow: `0 0 45px ${theme.accent3}`,
            }}
          >
            ★ SAVED GAME ★
          </div>
        </div>
      </Appear>

      {/* shockwaves */}
      {wave1 > 0 && wave1 < 1 && (
        <div
          style={{
            position: "absolute",
            left: 740 - wave1 * 380,
            top: 975 - wave1 * 380,
            width: wave1 * 760,
            height: wave1 * 760,
            borderRadius: "50%",
            border: `10px solid ${theme.good}`,
            opacity: 1 - wave1,
          }}
        />
      )}
      {wave2 > 0 && wave2 < 1 && (
        <div
          style={{
            position: "absolute",
            left: 740 - wave2 * 520,
            top: 975 - wave2 * 520,
            width: wave2 * 1040,
            height: wave2 * 1040,
            borderRadius: "50%",
            border: `6px solid ${theme.accent}`,
            opacity: 0.9 * (1 - wave2),
          }}
        />
      )}

      {/* memory cells */}
      {cells.map((c, i) => {
        const bob = Math.sin(frame / 14 + i * 2.1) * 16;
        const appear = interpolate(frame, [sec(0.24) + i * 4, sec(0.24) + i * 4 + 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const pulse = 1 + awake * 0.12 * Math.sin(frame / 6 + i) + (1 - awake) * 0;
        const glow = 10 + awake * (35 + 20 * Math.sin(frame / 7 + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x - c.s / 2,
              top: c.y - c.s / 2 + bob,
              width: c.s,
              height: c.s,
              opacity: appear,
              transform: `scale(${appear * pulse})`,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: awake > 0.5 ? theme.good : "#12351f",
                border: `8px solid ${awake > 0.5 ? "#eafff0" : "#2a6b3f"}`,
                boxShadow: `0 0 ${glow}px ${theme.good}, inset 0 0 30px rgba(0,0,0,0.5)`,
              }}
            />
            <div style={{ position: "absolute", left: "28%", top: "30%", width: "22%", height: "22%", borderRadius: "50%", background: "rgba(255,255,255,0.85)" }} />
            <div style={{ position: "absolute", left: "58%", top: "56%", width: "16%", height: "16%", borderRadius: "50%", background: "rgba(255,255,255,0.55)" }} />
            {awake < 0.5 && (
              <div style={{ position: "absolute", top: "38%", width: "100%", textAlign: "center", fontSize: 44, fontWeight: 900, color: "rgba(255,255,255,0.7)", fontFamily: theme.font }}>
                z z
              </div>
            )}
          </div>
        );
      })}

      {/* awake label */}
      <Appear at={sec(2.12)} outAt={sec(4.4)} style={{ position: "absolute", top: 1235, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 56, color: theme.good, textShadow: `0 0 22px ${theme.good}` }}>
          MEMORY CELLS AWAKE
        </div>
      </Appear>

      {/* viruses arrow formation */}
      {viruses.map((v, i) => {
        const start = sec(0.74) + i * 4;
        const p = interpolate(frame, [start, start + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const ease = 1 - Math.pow(1 - p, 3);
        const x = -260 + (v.x + 260) * ease;
        const wob = Math.sin(frame / 5 + i * 1.7) * 10;
        const y = v.y + wob;
        const coat = interpolate(frame, [sec(3.26) + i * 5, sec(4.82)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const shrivel = 1 - dissolve * 0.55;
        const isGrey = frame >= sec(4.82);
        const col = isGrey ? theme.muted : theme.accent2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 70 * shrivel,
              top: y - 70 * shrivel,
              width: 140 * shrivel,
              height: 140 * shrivel,
              opacity: p === 0 ? 0 : virusFade,
            }}
          >
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
              <div
                key={a}
                style={{
                  position: "absolute",
                  left: "46%",
                  top: "-14%",
                  width: 12,
                  height: 34,
                  background: col,
                  borderRadius: 6,
                  transform: `rotate(${a + frame * 1.2}deg)`,
                  transformOrigin: "50% 84px",
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                left: "10%",
                top: "10%",
                width: "80%",
                height: "80%",
                borderRadius: "50%",
                background: isGrey ? "#5a5a5a" : "#a5003a",
                border: `${6 + coat * 10}px solid ${coat > 0.4 ? "#fff" : col}`,
                boxShadow: coat > 0.1 ? `0 0 28px #fff` : `0 0 26px ${theme.accent2}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 52,
              }}
            >
              V
            </div>
          </div>
        );
      })}

      {/* antibody flood Y */}
      {Array.from({ length: 24 }).map((_, k) => {
        const src = cells[k % 3];
        const dst = viruses[k % 6];
        const startAb = sec(3.26) + (k % 8) * 3 + Math.floor(k / 8) * 7;
        const p = interpolate(frame, [startAb, startAb + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (p <= 0 || p >= 1) {
          return null;
        }
        const jx = (random(`abx-${k}`) - 0.5) * 90;
        const jy = (random(`aby-${k}`) - 0.5) * 90;
        const x = src.x + (dst.x - src.x) * p + jx * (1 - p);
        const y = src.y + (dst.y - src.y) * p + jy - Math.sin(p * Math.PI) * 70;
        const fadeOut = interpolate(frame, [sec(4.82), sec(5.4)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: x - 28,
              top: y - 36 + Math.sin(frame / 4 + k) * 6,
              width: 56,
              height: 72,
              opacity: Math.min(1, p * 5) * fadeOut,
              transform: `rotate(${-28 + k * 7}deg) scale(${0.9 + 0.3 * Math.sin(frame / 5 + k)})`,
              color: "#fff",
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 72,
              textShadow: "0 0 14px #fff, 0 0 26px #9df",
              textAlign: "center",
              lineHeight: "72px",
            }}
          >
            Y
          </div>
        );
      })}

      {/* finale shield */}
      {frame >= sec(4.82) - 2 && (
        <div style={{ position: "absolute", top: 440, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: 440,
              height: 500,
              transform: `scale(${Math.max(0.01, shieldPop)})`,
              filter: `drop-shadow(0 0 ${30 + shieldGlow * 55}px ${theme.accent})`,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(180deg, #0ff3ff 0%, #0891b2 55%, #083344 100%)`,
                clipPath: "polygon(50% 0%, 92% 12%, 92% 52%, 50% 100%, 8% 52%, 8% 12%)",
                border: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 18,
                background: "rgba(0,20,30,0.88)",
                clipPath: "polygon(50% 0%, 92% 12%, 92% 52%, 50% 100%, 8% 52%, 8% 12%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 96, lineHeight: "96px" }}>🛡️</div>
              <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 54, color: "#fff", letterSpacing: 1, marginTop: 8 }}>
                PROTECTED
              </div>
              <div style={{ width: 220, height: 8, background: theme.accent, borderRadius: 4, marginTop: 14, boxShadow: `0 0 18px ${theme.accent}` }} />
            </div>
          </div>
          <Appear at={sec(4.82) + 10} style={{ width: "100%", textAlign: "center" }}>
            <div
              style={{
                marginTop: 18,
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 102,
                lineHeight: "105px",
                color: "#fff",
                textShadow: `0 0 ${20 + shieldGlow * 30}px ${theme.accent}, 0 6px 0 #083344`,
              }}
            >
              IMMUNE
              <br />
              MEMORY
            </div>
          </Appear>
        </div>
      )}
    </AbsoluteFill>
  );
}