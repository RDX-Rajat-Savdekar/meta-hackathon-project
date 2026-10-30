import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, random } from "remotion";
import { theme, sec, ramp, useSpringAt, Appear } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const sA = useSpringAt(sec(3.94), 10);
  const sB = useSpringAt(sec(3.94) + 7, 10);
  const sC = useSpringAt(sec(3.94) + 14, 10);
  const sD = useSpringAt(sec(3.94) + 21, 10);

  const f1 = sec(1.14);
  const f2 = sec(2.6);
  const f3 = sec(3.94);
  const f4 = sec(6.3);
  const f5 = sec(7.06);

  const enlarge = interpolate(frame, [f1, f1 + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dividerGrow = interpolate(frame, [f2, f2 + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rightSlide = interpolate(frame, [f2, f2 + 20], [560, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rightOp = interpolate(frame, [f2, f2 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dnaIn = ramp(frame, f2, 12);
  const glowAll = interpolate(frame, [f4, f4 + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gUp = interpolate(frame, [f4, f4 + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gDown = interpolate(frame, [f4 + 6, f4 + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gFlash = gUp * (1 - gDown);
  const qIn = ramp(frame, f5, 12);
  const morphT = interpolate(frame, [f5, f5 + 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fileShift = interpolate(frame, [f5, f5 + 45], [-10, 14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const qPulse = Math.sin(frame * 0.28) * 0.12;
  const qScale = 1 + qPulse * qIn;

  const cols = [0, 1, 2, 3, 4];
  const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const letters = [
    { ch: "A", color: theme.good, s: sA, i: 0 },
    { ch: "T", color: theme.accent3, s: sB, i: 1 },
    { ch: "C", color: theme.accent, s: sC, i: 2 },
    { ch: "G", color: theme.accent2, s: sD, i: 3 },
  ];

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      {/* middle band backdrop */}
      <div style={{ position: "absolute", left: 0, top: 576, width: 1080, height: 768, background: "rgba(255,255,255,0.02)", borderTop: "2px solid rgba(255,255,255,0.12)", borderBottom: "2px solid rgba(255,255,255,0.12)" }} />

      {/* LEFT PANEL */}
      <div style={{ position: "absolute", left: 0, top: 576, width: 540, height: 768, overflow: "hidden", background: "rgba(255,255,255,0.045)" }}>
        <div style={{ position: "absolute", top: 22, width: "100%", textAlign: "center", fontFamily: theme.mono, fontWeight: 800, fontSize: 48, letterSpacing: 8, color: theme.muted, opacity: 0.9 }}>BITS</div>
        {cols.map((c) =>
          rows.map((r) => {
            const baseX = 28 + c * 102 + random(`bx-${c}`) * 26;
            const off = random(`off-${c}-${r}`) * 850;
            const speed = 2.2 + random(`sp-${c}-${r}`) * 3.6;
            const yL = ((off + frame * speed) % 830) - 30;
            const digit = random(`bit-${c}-${r}`) > 0.48 ? "1" : "0";
            const isZero = digit === "0";
            const march = ((frame - f1) * 2.2 + r * 22) % 110;
            const xShift = frame >= f1 ? (march - 55) * 0.7 : 0;
            const x = baseX + xShift;
            const fs = 48 + random(`fs-${c}-${r}`) * 12 + enlarge * 32;
            const fade = interpolate(yL, [-30, 80, 620, 800], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const op = fade * (0.5 + 0.5 * random(`op-${c}-${r}`));
            const col = isZero && frame >= f1 ? theme.accent : theme.fg;
            const glow = isZero && frame >= f1 ? `0 0 ${14 + enlarge * 22}px ${theme.accent}` : "none";
            return (
              <div key={`${c}-${r}`} style={{ position: "absolute", left: x, top: yL, fontFamily: theme.mono, fontWeight: 900, fontSize: fs, lineHeight: 1, color: col, opacity: op, textShadow: glow }}>
                {digit}
              </div>
            );
          })
        )}
        <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 160, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.55))" }} />
      </div>

      {/* RIGHT PANEL outer */}
      <div style={{ position: "absolute", left: 540, top: 576, width: 540, height: 768, overflow: "hidden", background: "#0C1326" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 540, height: 768, transform: `translateX(${rightSlide}px)`, opacity: rightOp }}>
          <div style={{ position: "absolute", top: 28, width: "100%", display: "flex", justifyContent: "center", opacity: dnaIn, transform: `scale(${0.6 + 0.4 * dnaIn})` }}>
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 54, letterSpacing: 14, color: theme.fg, border: `3px solid ${theme.muted}`, borderRadius: 999, padding: "8px 34px 8px 48px", background: "rgba(255,255,255,0.05)" }}>
              DNA
            </div>
          </div>
          {letters.map((L) => {
            const sc = Math.max(0.001, L.s);
            const lop = interpolate(L.s, [0, 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const floatY = Math.sin(frame * 0.06 + L.i * 1.7) * 14;
            const isG = L.ch === "G";
            const extraG = isG ? gFlash * 0.55 : 0;
            const scale = sc * (1 + extraG) * (1 + glowAll * 0.08);
            const shadowBlur = 12 + glowAll * 34 + (isG ? gFlash * 40 : 0);
            const px = L.i % 2 === 0 ? 42 : 282;
            const py = L.i < 2 ? 168 : 438;
            return (
              <div key={L.ch} style={{ position: "absolute", left: px, top: py + floatY, width: 216, height: 240, display: "flex", alignItems: "center", justifyContent: "center", opacity: lop, transform: `scale(${scale})` }}>
                <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 186, lineHeight: 1, color: L.color, textShadow: `0 0 ${shadowBlur}px ${L.color}, 0 0 ${8 + glowAll * 18}px rgba(255,255,255,0.75)` }}>
                  {L.ch}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* divider */}
      <div style={{ position: "absolute", left: 538, top: 576, width: 5, height: 768, background: theme.muted, transform: `scaleY(${Math.max(0.001, dividerGrow)})`, transformOrigin: "50% 50%", opacity: 0.4 + dividerGrow * 0.6, boxShadow: `0 0 ${dividerGrow * 24}px rgba(255,255,255,0.35)` }} />

      {/* kinetic headlines */}
      <Appear at={sec(0)} outAt={sec(1.14)} dy={40} style={{ position: "absolute", top: 222, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 104, color: theme.fg, lineHeight: 1 }}>Computers</div>
        <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: 52, color: theme.muted, letterSpacing: 6, marginTop: 12 }}>SPEAK IN BITS</div>
      </Appear>
      <Appear at={sec(1.14)} outAt={sec(2.6)} dy={40} style={{ position: "absolute", top: 222, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 108, lineHeight: 1, color: theme.accent, textShadow: `0 0 34px ${theme.accent}` }}>ZEROS</div>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 84, lineHeight: 1, color: theme.fg, marginTop: 8 }}>&amp; ONES</div>
      </Appear>
      <Appear at={sec(2.6)} outAt={sec(3.94)} dy={40} style={{ position: "absolute", top: 232, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 82, color: theme.muted, lineHeight: 1 }}>but DNA…</div>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 108, color: theme.accent3, lineHeight: 1, textShadow: `0 0 30px ${theme.accent3}` }}>DNA</div>
      </Appear>
      <Appear at={sec(3.94)} outAt={sec(6.3)} dy={40} style={{ position: "absolute", top: 232, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: 56, color: theme.fg, letterSpacing: 4 }}>SPEAKS IN</div>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 108, color: theme.accent2, lineHeight: 1, textShadow: `0 0 30px ${theme.accent2}` }}>FOUR</div>
      </Appear>
      <Appear at={sec(6.3)} outAt={sec(7.06)} dy={30} style={{ position: "absolute", top: 260, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 96, letterSpacing: 6, color: theme.fg }}>
          <span style={{ color: theme.good }}>A</span> <span style={{ color: theme.accent3 }}>T</span> <span style={{ color: theme.accent }}>C</span> <span style={{ color: theme.accent2, textShadow: `0 0 36px ${theme.accent2}` }}>G</span>
        </div>
        <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: 52, color: theme.accent2, marginTop: 10, letterSpacing: 4 }}>G FLASHES</div>
      </Appear>
      <Appear at={sec(7.06)} dy={40} style={{ position: "absolute", top: 232, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 88, color: theme.fg, lineHeight: 1 }}>how into</div>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 96, color: theme.accent3, lineHeight: 1, marginTop: 6, textShadow: `0 0 28px ${theme.accent3}` }}>CHEMISTRY?</div>
      </Appear>

      {/* pulsing question */}
      <div style={{ position: "absolute", left: 0, top: 842, width: 1080, height: 220, display: "flex", alignItems: "center", justifyContent: "center", opacity: qIn }}>
        <div style={{ width: 188, height: 188, borderRadius: "50%", border: `6px solid ${theme.fg}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${qScale})`, boxShadow: "0 0 42px rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.72)" }}>
          <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 128, color: theme.fg, lineHeight: 1, transform: `scale(${qScale})`, textShadow: "0 0 28px rgba(255,255,255,0.9)" }}>?</div>
        </div>
      </div>

      {/* file -> flask */}
      <div style={{ position: "absolute", left: 0, top: 1092, width: 1080, height: 200, display: "flex", alignItems: "center", justifyContent: "center", opacity: qIn }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 94, height: 118, border: `5px solid ${theme.fg}`, borderRadius: 14, background: "rgba(255,255,255,0.07)", position: "relative", transform: `translateX(${fileShift}px)` }}>
            <div style={{ position: "absolute", top: 16, left: 16, right: 16, height: 9, background: theme.fg, opacity: 0.9, borderRadius: 4 }} />
            <div style={{ position: "absolute", top: 34, left: 16, right: 30, height: 9, background: theme.muted, opacity: 0.9, borderRadius: 4 }} />
            <div style={{ position: "absolute", top: 58, left: 0, width: "100%", textAlign: "center", fontFamily: theme.mono, fontWeight: 800, fontSize: 50, color: theme.accent }}>01</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", opacity: 0.35 + morphT * 0.65 }}>
            <div style={{ width: 20 + morphT * 52, height: 6, background: theme.muted, borderRadius: 3 }} />
            <div style={{ width: 26, height: 26, background: theme.muted, clipPath: "polygon(0 30%,100% 50%,0 70%)", marginLeft: -4 }} />
          </div>
          <div style={{ width: 112, height: 132, position: "relative", opacity: morphT, transform: `scale(${0.55 + 0.45 * morphT})` }}>
            <div style={{ position: "absolute", top: 0, left: 39, width: 34, height: 30, border: `5px solid ${theme.good}`, borderBottom: "none", borderRadius: "8px 8px 0 0" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, width: 112, height: 88, border: `5px solid ${theme.good}`, borderRadius: 20, background: "rgba(34,197,94,0.16)", overflow: "hidden", boxShadow: `0 0 ${12 + morphT * 28}px ${theme.good}` }}>
              {[0, 1, 2].map((b) => {
                const by = 62 - ((frame * 3 + b * 22) % 60);
                const bx = 24 + b * 22 + Math.sin(frame * 0.2 + b * 2) * 6;
                return <div key={b} style={{ position: "absolute", left: bx, top: by, width: 14, height: 14, borderRadius: "50%", background: theme.good, opacity: 0.9 }} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}