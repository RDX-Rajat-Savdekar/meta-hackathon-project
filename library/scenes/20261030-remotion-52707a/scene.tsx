import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme, sec, ramp, Appear, Title } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spikeIn = spring({ frame: frame - sec(3.5), fps, config: { damping: 14 } });
  const spikeScale = interpolate(spikeIn, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spikeBob = Math.sin((frame - sec(3.5)) * 0.12) * 16;

  const spikeX = interpolate(frame, [sec(3.5), sec(7.12), sec(8.1), sec(9.56)], [540, 540, 380, 560], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spikeY = 960 + spikeBob + interpolate(frame, [sec(8.1), sec(10.6)], [0, -20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const syringeX = interpolate(frame, [sec(0.3), sec(1.1)], [-280, 250], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const syringeOp = 1 - ramp(frame, sec(2.8), 15);
  const injectPush = interpolate(frame, [sec(1.4), sec(1.8)], [0, 36], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const dupOp = interpolate(frame, [sec(5.7), sec(6.0), sec(6.6), sec(7.12)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const xSpringRaw = spring({ frame: frame - sec(6.04), fps, config: { damping: 14 } });
  const xScale = interpolate(xSpringRaw, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const patrolX = interpolate(frame, [sec(7.12), sec(8.1), sec(9.56), sec(10.2)], [-360, 320, 320, 500], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const patrolY = 960 + Math.sin(frame * 0.1) * 10;
  const patrolSquishX = 1 + Math.sin(frame * 0.15) * 0.06;
  const patrolSquishY = 1 - Math.sin(frame * 0.15) * 0.06;
  const patrolDim = interpolate(frame, [sec(7.12), sec(7.5), sec(10.6), sec(11.0)], [1, 1, 0.45, 0.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const nodeRaw = spring({ frame: frame - sec(8.7), fps, config: { damping: 14 } });
  const nodeScale = interpolate(nodeRaw, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nodeGlow = 0.55 + 0.45 * Math.sin(frame * 0.08);
  const nodeX = 790;
  const nodeY = 980;

  const inMugWindow = frame >= sec(9.56) && frame < sec(10.6);
  const mugBlink = inMugWindow ? (Math.sin((frame - sec(9.56)) * 0.62) * 0.5 + 0.5 > 0.35 ? 1 : 0.12) : 0;

  const bRaw = spring({ frame: frame - sec(10.6), fps, config: { damping: 14 } });
  const bScale = interpolate(bRaw, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring1 = interpolate(frame, [sec(10.6), sec(11.3)], [50, 190], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring1Op = 1 - ramp(frame, sec(10.6), 22);
  const ring2 = interpolate(frame, [sec(11.0), sec(11.7)], [40, 170], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring2Op = 1 - ramp(frame, sec(11.0), 22);

  const armyT = ramp(frame, sec(14.32), 18);
  const dieT = ramp(frame, sec(19.56), 22);
  const memT = ramp(frame, sec(21.42), 18);

  const focalArmy = interpolate(frame, [sec(14.32), sec(19.56)], [0, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const clonePos: { dx: number; dy: number }[] = [
    { dx: -110, dy: -140 }, { dx: 0, dy: -140 }, { dx: 110, dy: -140 },
    { dx: -110, dy: -45 }, { dx: 0, dy: -45 }, { dx: 110, dy: -45 },
    { dx: -110, dy: 50 }, { dx: 0, dy: 50 }, { dx: 110, dy: 50 },
    { dx: -110, dy: 150 }, { dx: 0, dy: 150 }, { dx: 110, dy: 150 },
  ];

  const abCount = 14;

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      {/* vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, #22384f 0%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.65) 100%)" }} />

      <Title text="VACCINE DRILL" at={0} size={92} y={240} color={theme.fg} />

      {/* SAFE label */}
      <Appear at={sec(0.52)} style={{ position: "absolute", top: 400, width: "100%", textAlign: "center" }}>
        <div style={{ display: "inline-block", fontFamily: theme.font, fontWeight: 900, fontSize: 48, color: theme.bg, background: theme.fg, padding: "10px 34px", borderRadius: 999 }}>
          SAFE PRACTICE ROUND
        </div>
      </Appear>

      {/* Syringe */}
      <div style={{ position: "absolute", left: syringeX, top: 780, opacity: syringeOp < 0 ? 0 : syringeOp, transform: "rotate(-18deg)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 180, height: 62, background: theme.fg, borderRadius: 14, border: `6px solid ${theme.muted}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.mono, fontWeight: 900, fontSize: 30, color: theme.bg }}>
            Vx
          </div>
          <div style={{ width: 90, height: 12, background: theme.muted }} />
          <div style={{ width: 8, height: 8, background: theme.fg, borderRadius: "50%" }} />
          <div style={{ width: 44 + injectPush, height: 18, background: theme.accent3, borderRadius: 6, marginLeft: -140, marginTop: 0 }} />
        </div>
        <div style={{ marginLeft: 170, marginTop: 6, width: 4, height: 90, background: theme.fg, transform: "rotate(90deg)", transformOrigin: "top" }} />
      </div>

      {/* Lymph node oval */}
      {frame >= sec(8.7) && (
        <div style={{ position: "absolute", left: nodeX - 190 * nodeScale, top: nodeY - 230 * nodeScale, width: 380 * nodeScale, height: 460 * nodeScale, opacity: nodeScale }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "rgba(255,45,174,0.22)", border: `8px solid ${theme.accent2}`, boxShadow: `0 0 ${40 + nodeGlow * 60}px ${theme.accent2}, inset 0 0 60px rgba(255,45,174,0.5)` }} />
          <div style={{ position: "absolute", top: -78, width: "100%", textAlign: "center", fontFamily: theme.font, fontWeight: 900, fontSize: 48, color: theme.accent2 }}>
            LYMPH NODE
          </div>
        </div>
      )}

      {/* Mugshot flashes above node */}
      <div style={{ position: "absolute", left: 540 - 110, top: 560, width: 220, height: 150, opacity: mugBlink, alignItems: "center", display: "flex", flexDirection: "column" }}>
        <div style={{ width: 180, height: 110, borderRadius: 22, border: `6px solid ${theme.accent3}`, background: "#101418", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 34px ${theme.accent3}` }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: theme.accent3, position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: -22, width: 8, height: 26, background: theme.accent3, borderRadius: 4, transform: "rotate(-22deg)" }} />
            <div style={{ position: "absolute", left: 22, top: -26, width: 8, height: 30, background: theme.accent3, borderRadius: 4 }} />
            <div style={{ position: "absolute", left: 32, top: -22, width: 8, height: 26, background: theme.accent3, borderRadius: 4, transform: "rotate(22deg)" }} />
          </div>
        </div>
        <div style={{ marginTop: 8, fontFamily: theme.font, fontWeight: 900, fontSize: 34, color: theme.accent3 }}>MUGSHOT</div>
      </div>

      {/* Patrol amoeba */}
      {frame >= sec(7.12) && (
        <div style={{ position: "absolute", left: patrolX - 150 * patrolSquishX, top: patrolY - 120, width: 300, height: 240, opacity: patrolDim < 0.45 ? 0.45 : patrolDim }}>
          <div style={{ position: "absolute", left: 0, top: 20, width: 300, height: 200, background: theme.muted, borderRadius: "48% 52% 55% 45% / 58% 60% 40% 42%", transform: `scale(${patrolSquishX},${patrolSquishY})`, boxShadow: "0 0 30px rgba(255,255,255,0.25)", border: "4px solid rgba(255,255,255,0.4)" }} />
          <div style={{ position: "absolute", left: -26, top: 70, width: 90, height: 90, background: theme.muted, borderRadius: "50%", transform: `scale(${patrolSquishX},${patrolSquishY})` }} />
          <div style={{ position: "absolute", left: 236, top: 90, width: 70, height: 70, background: theme.muted, borderRadius: "50%" }} />
          <div style={{ position: "absolute", left: 90, top: 70, width: 34, height: 34, borderRadius: "50%", background: "#0b0e12" }} />
          <div style={{ position: "absolute", left: 150, top: 78, width: 26, height: 26, borderRadius: "50%", background: "#0b0e12" }} />
          <div style={{ position: "absolute", top: -72, width: 300, textAlign: "center", fontFamily: theme.font, fontWeight: 900, fontSize: 46, color: theme.fg }}>PATROL</div>
        </div>
      )}

      {/* Single yellow spike (until army takes over, dim after) */}
      {frame >= sec(3.5) && armyT < 0.6 && (
        <div style={{ position: "absolute", left: spikeX - 70 * spikeScale, top: spikeY - 70 * spikeScale, width: 140, height: 140, opacity: spikeScale, transform: `scale(${spikeScale})` }}>
          <div style={{ position: "absolute", left: 46, top: -52, width: 18, height: 70, background: theme.accent3, borderRadius: 9, transform: "rotate(-28deg)", boxShadow: `0 0 22px ${theme.accent3}` }} />
          <div style={{ position: "absolute", left: 61, top: -60, width: 18, height: 78, background: theme.accent3, borderRadius: 9, boxShadow: `0 0 22px ${theme.accent3}` }} />
          <div style={{ position: "absolute", left: 76, top: -52, width: 18, height: 70, background: theme.accent3, borderRadius: 9, transform: "rotate(28deg)", boxShadow: `0 0 22px ${theme.accent3}` }} />
          <div style={{ position: "absolute", left: 38, top: -72, width: 30, height: 30, borderRadius: "50%", background: theme.accent3 }} />
          <div style={{ position: "absolute", left: 55, top: -84, width: 30, height: 30, borderRadius: "50%", background: theme.accent3 }} />
          <div style={{ position: "absolute", left: 74, top: -72, width: 30, height: 30, borderRadius: "50%", background: theme.accent3 }} />
          <div style={{ position: "absolute", left: 15, top: 15, width: 110, height: 110, borderRadius: "50%", background: theme.accent3, boxShadow: `0 0 44px ${theme.accent3}`, border: "8px solid #fff3b0" }} />
          <div style={{ position: "absolute", top: 132, width: 140, textAlign: "center", fontFamily: theme.font, fontWeight: 900, fontSize: 40, color: theme.accent3 }}>1 SPIKE</div>
        </div>
      )}

      {/* No-multiply crossed icon */}
      <div style={{ position: "absolute", left: 540 - 130, top: 640, width: 260, height: 140, opacity: dupOp }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 1 }}>
          <div style={{ fontSize: 82, color: theme.fg, fontWeight: 900, fontFamily: theme.font }}>↗</div>
          <div style={{ fontSize: 82, color: theme.fg, fontWeight: 900, fontFamily: theme.font, transform: "scaleX(-1)" }}>↗</div>
        </div>
        <div style={{ position: "absolute", left: 55, top: -10, width: 150, height: 130, transform: `scale(${xScale})`, opacity: xScale }}>
          <div style={{ position: "absolute", left: 65, top: 0, width: 20, height: 130, background: theme.fg, transform: "rotate(45deg)", borderRadius: 10 }} />
          <div style={{ position: "absolute", left: 65, top: 0, width: 20, height: 130, background: theme.fg, transform: "rotate(-45deg)", borderRadius: 10 }} />
        </div>
        <div style={{ textAlign: "center", fontFamily: theme.font, fontWeight: 900, fontSize: 44, color: theme.fg }}>CAN'T COPY</div>
      </div>

      {/* Single matching B cell wake-up */}
      {frame >= sec(10.6) && armyT < 0.5 && (
        <div style={{ position: "absolute", left: nodeX - 60 * bScale, top: nodeY - 60 * bScale, width: 120, height: 120, opacity: bScale }}>
          <div style={{ position: "absolute", left: -ring1 / 2 + 60, top: -ring1 / 2 + 60, width: ring1, height: ring1, borderRadius: "50%", border: `6px solid ${theme.accent}`, opacity: ring1Op }} />
          <div style={{ position: "absolute", left: -ring2 / 2 + 60, top: -ring2 / 2 + 60, width: ring2, height: ring2, borderRadius: "50%", border: `5px solid ${theme.accent}`, opacity: ring2Op }} />
          <div style={{ width: 120, height: 120, borderRadius: "50%", background: theme.accent, boxShadow: `0 0 46px ${theme.accent}`, border: "6px solid white", transform: `scale(${bScale})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.font, fontWeight: 900, fontSize: 52, color: "#062a33" }}>B</div>
          <div style={{ position: "absolute", top: 128, width: 120, textAlign: "center", fontFamily: theme.font, fontWeight: 900, fontSize: 40, color: theme.accent }}>MATCH!</div>
        </div>
      )}

      {/* 12-cell army grid */}
      {armyT > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: 1 }}>
          {clonePos.map((p, i) => {
            const stagger = spring({ frame: frame - (sec(14.32) + i * 3), fps, config: { damping: 14 } });
            const sc = interpolate(stagger, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const isSurvivor = i >= 9;
            const sink = isSurvivor ? 0 : dieT * 170;
            const fade = isSurvivor ? 1 : 1 - dieT * 0.78;
            const col = memT > 0.05 && isSurvivor ? theme.good : !isSurvivor && dieT > 0.25 ? theme.muted : theme.accent;
            const glow = memT > 0.05 && isSurvivor ? `0 0 42px ${theme.good}` : `0 0 26px ${col}`;
            const bobY = memT > 0.3 && isSurvivor ? Math.sin(frame * 0.1 + i * 1.3) * 12 : Math.sin(frame * 0.14 + i) * (isSurvivor ? 6 : 4);
            void focalArmy;
            return (
              <div key={i} style={{ position: "absolute", left: nodeX + p.dx - 42, top: nodeY - 40 + p.dy + sink + bobY, width: 84, height: 110, opacity: sc * fade, transform: `scale(${sc})` }}>
                <div style={{ width: 84, height: 84, borderRadius: "50%", background: col, border: "5px solid white", boxShadow: glow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.font, fontWeight: 900, fontSize: 38, color: "#08222b" }}>B</div>
                {memT > 0.4 && isSurvivor && (
                  <div style={{ marginTop: 4, textAlign: "center", fontFamily: theme.font, fontWeight: 900, fontSize: 20, color: theme.bg, background: theme.good, borderRadius: 999, padding: "3px 6px", opacity: memT, boxShadow: `0 0 18px ${theme.good}` }}>
                    MEMORY
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Antibody Y streams */}
      {frame >= sec(14.32) && dieT < 0.95 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
          {Array.from({ length: abCount }).map((_, i) => {
            const ang = (i / abCount) * Math.PI * 2 + 0.3;
            const dist = 300 + (i % 3) * 70;
            const ex = nodeX + Math.cos(ang) * dist;
            const ey = nodeY - 40 + Math.sin(ang) * dist * 0.9;
            const prog = ramp(frame, sec(14.32) + i * 4, 20);
            const cx = interpolate(prog, [0, 1], [nodeX, ex], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const cy = interpolate(prog, [0, 1], [nodeY, ey], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const op = prog * (1 - dieT);
            const locked = prog > 0.85 ? 1 : 0;
            return (
              <div key={i} style={{ position: "absolute", left: cx - 24, top: cy - 30, width: 48, height: 60, opacity: op < 0 ? 0 : op, transform: `rotate(${ang * 57.3}deg)` }}>
                <div style={{ textAlign: "center", fontFamily: theme.font, fontWeight: 900, fontSize: 58, color: locked ? theme.accent3 : theme.fg, textShadow: locked ? `0 0 16px ${theme.accent3}` : "0 0 12px rgba(255,255,255,0.7)", lineHeight: 1 }}>Y</div>
                {locked ? <div style={{ width: 26, height: 26, borderRadius: "50%", background: theme.accent3, margin: "-10px auto 0 auto", border: "3px solid white" }} /> : null}
              </div>
            );
          })}
          <div style={{ position: "absolute", top: 590, width: "100%", textAlign: "center", opacity: 1 - dieT, fontFamily: theme.font, fontWeight: 900, fontSize: 52, color: theme.fg }}>
            CLONE ARMY ×12
          </div>
        </div>
      )}

      {/* Die-off label + memory label */}
      {frame >= sec(19.56) && frame < sec(21.42) && (
        <div style={{ position: "absolute", top: 590, width: "100%", textAlign: "center" }}>
          <div style={{ display: "inline-block", fontFamily: theme.font, fontWeight: 900, fontSize: 54, color: theme.muted, background: "rgba(0,0,0,0.6)", padding: "8px 28px", borderRadius: 18, border: `3px solid ${theme.muted}` }}>
            MOST FADE AWAY
          </div>
        </div>
      )}
      {frame >= sec(21.42) && (
        <div style={{ position: "absolute", top: 480, width: "100%", textAlign: "center" }}>
          <div style={{ display: "inline-block", fontFamily: theme.font, fontWeight: 900, fontSize: 60, color: theme.good, background: "rgba(0,0,0,0.65)", padding: "10px 32px", borderRadius: 20, border: `4px solid ${theme.good}`, boxShadow: `0 0 30px ${theme.good}` }}>
            3 STAY ON GUARD
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}