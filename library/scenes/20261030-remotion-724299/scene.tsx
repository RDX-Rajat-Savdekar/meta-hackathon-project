import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme, sec, Appear, Title } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wireY = 864;
  const wireLeft = 300;
  const wireRight = 780;
  const wireW = wireRight - wireLeft;

  const popSyn = spring({ frame: Math.max(0, frame - sec(2.76)), fps, config: { damping: 14 } });
  const popSynAck = spring({ frame: Math.max(0, frame - sec(9.94)), fps, config: { damping: 14 } });
  const popAck = spring({ frame: Math.max(0, frame - sec(17.66)), fps, config: { damping: 14 } });
  const popLock = spring({ frame: Math.max(0, frame - sec(25.42)), fps, config: { damping: 14 } });

  const laptopBoost1 = interpolate(frame, [sec(2.76), sec(3.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const laptopBoost2 = interpolate(frame, [sec(17.66), sec(18.1)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const serverBoost = interpolate(frame, [sec(9.94), sec(10.4)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const settle = interpolate(frame, [sec(0.48), sec(1.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const laptopScale = 1 + 0.16 * laptopBoost1 + 0.12 * laptopBoost2;
  const serverScale = 1 + 0.18 * serverBoost;
  const floatL = Math.sin(frame / 18) * 6;
  const floatS = Math.sin(frame / 18 + 1.6) * 6;
  const pulse = (Math.sin(frame / 12) + 1) / 2;

  const lockedK = interpolate(frame, [sec(25.42), sec(25.75)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wireColor = frame >= sec(25.42) ? theme.good : theme.fg;
  const wireH = 6 + 6 * lockedK;
  const wireGlow = 6 + 10 * pulse * (1 - lockedK) + 22 * lockedK;

  // packets
  const p1cx = interpolate(frame, [sec(4.42), sec(8.0)], [wireLeft, wireRight], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p1in = interpolate(frame, [sec(4.42), sec(4.62)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p1out = interpolate(frame, [sec(8.2), sec(8.6)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p1op = p1in * p1out;

  const p2cx = interpolate(frame, [sec(11.95), sec(16.2)], [wireRight, wireLeft], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p2in = interpolate(frame, [sec(11.95), sec(12.15)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p2out = interpolate(frame, [sec(16.4), sec(16.9)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p2op = p2in * p2out;

  const p3form = interpolate(frame, [sec(17.66), sec(18.0)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p3cx = interpolate(frame, [sec(19.32), sec(23.2)], [wireLeft, wireRight], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p3in = interpolate(frame, [sec(19.32), sec(19.52)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p3out = interpolate(frame, [sec(23.4), sec(23.9)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p3travel = frame >= sec(19.32) ? 1 : 0;
  const p3op = Math.max(p3form * (1 - p3travel), p3in * p3out);
  const p3xShow = frame < sec(19.32) ? wireLeft : p3cx;

  const lapHasSeq = frame >= sec(8.78);
  const srvHasSeq = frame >= sec(11.95);
  const srvHasExp = frame >= sec(15.68);
  const lapHasExp = frame >= sec(19.32);
  const isLocked = frame >= sec(25.42);

  const lapBorder = isLocked ? theme.good : lapHasSeq ? theme.fg : theme.muted;
  const srvBorder = isLocked ? theme.good : srvHasSeq ? theme.fg : theme.muted;

  let stepText = "LAPTOP ─── SERVER";
  let stepColor: string = theme.muted;
  if (frame >= sec(25.42)) {
    stepText = "LOCKED · CAN SEND + RECEIVE";
    stepColor = theme.good;
  } else if (frame >= sec(17.66)) {
    stepText = "STEP 3 · ACK →";
    stepColor = theme.accent3;
  } else if (frame >= sec(9.94)) {
    stepText = "STEP 2 · ← SYN-ACK";
    stepColor = theme.accent2;
  } else if (frame >= sec(2.76)) {
    stepText = "STEP 1 · SYN →";
    stepColor = theme.accent;
  }

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Title text="3-WAY HANDSHAKE" at={0} size={88} y={225} color={theme.fg} />

      {/* counter boxes */}
      <div style={{ position: "absolute", left: 55, top: 470, width: 410, height: 218, borderRadius: 28, border: `5px solid ${lapBorder}`, background: isLocked ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.04)", padding: "18px 22px", opacity: 0.25 + 0.75 * settle, boxShadow: isLocked ? `0 0 34px ${theme.good}` : lapHasSeq ? "0 0 22px rgba(255,255,255,0.35)" : "none" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: 38, color: isLocked ? theme.good : lapHasSeq ? theme.fg : theme.muted, letterSpacing: 2 }}>MY SEQ {isLocked ? "🔒" : ""}</div>
        <div style={{ fontFamily: theme.mono, fontWeight: 900, fontSize: 84, lineHeight: 1, color: isLocked ? theme.good : lapHasSeq ? "#fff" : theme.muted }}>{lapHasSeq ? "42" : "––"}</div>
        <div style={{ fontFamily: theme.mono, fontWeight: 800, fontSize: 44, color: isLocked ? theme.good : theme.accent3, marginTop: 4, opacity: lapHasExp ? 1 : 0 }}>EXPECT {lapHasExp ? "101" : ""}</div>
      </div>

      <div style={{ position: "absolute", right: 55, top: 470, width: 410, height: 258, borderRadius: 28, border: `5px solid ${srvBorder}`, background: isLocked ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.04)", padding: "18px 22px", opacity: 0.25 + 0.75 * settle, boxShadow: isLocked ? `0 0 34px ${theme.good}` : srvHasSeq ? "0 0 22px rgba(255,255,255,0.35)" : "none" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: 38, color: isLocked ? theme.good : srvHasSeq ? theme.fg : theme.muted, letterSpacing: 2 }}>MY SEQ {isLocked ? "🔒" : ""}</div>
        <div style={{ fontFamily: theme.mono, fontWeight: 900, fontSize: 84, lineHeight: 1, color: isLocked ? theme.good : srvHasSeq ? "#fff" : theme.muted }}>{srvHasSeq ? "100" : "––"}</div>
        <div style={{ fontFamily: theme.mono, fontWeight: 800, fontSize: 44, color: isLocked ? theme.good : theme.accent, marginTop: 4, opacity: srvHasExp ? 1 : 0 }}>EXPECT {srvHasExp ? "43" : ""}</div>
      </div>

      {/* kinetic labels above wire */}
      <Appear at={sec(2.76)} outAt={sec(9.94)} dy={30} style={{ position: "absolute", left: 55, top: 712, width: 410, textAlign: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 92, color: theme.accent, transform: `scale(${0.6 + 0.4 * popSyn})`, textShadow: `0 0 28px ${theme.accent}` }}>SYN</div>
      </Appear>
      <Appear at={sec(9.94)} outAt={sec(17.66)} dy={30} style={{ position: "absolute", right: 55, top: 712, width: 410, textAlign: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 78, color: theme.accent2, transform: `scale(${0.6 + 0.4 * popSynAck})`, textShadow: `0 0 28px ${theme.accent2}` }}>SYN + ACK</div>
      </Appear>
      <Appear at={sec(17.66)} dy={30} style={{ position: "absolute", left: 0, top: 706, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 96, color: theme.accent3, transform: `scale(${0.6 + 0.4 * popAck})`, textShadow: `0 0 28px ${theme.accent3}` }}>ACK</div>
      </Appear>

      {/* wire */}
      <div style={{ position: "absolute", left: wireLeft, top: wireY, width: wireW, height: wireH, background: wireColor, borderRadius: 10, boxShadow: `0 0 ${wireGlow}px ${wireColor}`, opacity: 0.3 + 0.7 * settle }} />
      <div style={{ position: "absolute", left: wireLeft, top: wireY - 26, width: wireW, height: 60 }}>
        {[0, 1, 2, 3].map((i) => {
          const x = wireLeft + ((frame * 7 + i * 130) % (wireW + 40)) - 20 - wireLeft;
          return <div key={i} style={{ position: "absolute", left: x, top: 20, width: 16, height: 16, borderRadius: 8, background: isLocked ? theme.good : theme.fg, opacity: 0.35 }} />;
        })}
      </div>

      {/* laptop left */}
      <div style={{ position: "absolute", left: 40, top: 960 + floatL, width: 380, height: 320, transform: `scale(${laptopScale})`, transformOrigin: "center", opacity: 0.2 + 0.8 * settle }}>
        <div style={{ margin: "0 auto", width: 280, height: 180, borderRadius: 18, border: `8px solid ${theme.accent}`, background: "#0B1220", boxShadow: `0 0 ${18 + 26 * laptopBoost1 + 22 * laptopBoost2 + 8 * pulse}px ${theme.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: theme.mono, fontWeight: 900, fontSize: 72, color: theme.accent }}>{">_"}</div>
        </div>
        <div style={{ margin: "0 auto", marginTop: -8, width: 330, height: 26, borderRadius: 8, background: theme.accent, opacity: 0.95, boxShadow: `0 0 20px ${theme.accent}` }} />
        <div style={{ textAlign: "center", fontFamily: theme.font, fontWeight: 900, fontSize: 52, color: theme.accent, marginTop: 12, letterSpacing: 3 }}>LAPTOP</div>
      </div>

      {/* server right */}
      <div style={{ position: "absolute", right: 40, top: 930 + floatS, width: 380, height: 360, transform: `scale(${serverScale})`, transformOrigin: "center", opacity: 0.2 + 0.8 * settle }}>
        <div style={{ margin: "0 auto", width: 280, height: 250, borderRadius: 22, border: `8px solid ${theme.accent2}`, background: "#150B1E", boxShadow: `0 0 ${18 + 26 * serverBoost + 8 * pulse}px ${theme.accent2}`, padding: 16 }}>
          {[0, 1, 2].map((r) => (
            <div key={r} style={{ height: 58, borderRadius: 12, background: "rgba(255,255,255,0.07)", marginBottom: 12, display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: r === 1 && frame >= sec(11.95) ? theme.accent2 : theme.good, boxShadow: `0 0 12px ${theme.good}` }} />
              <div style={{ flex: 1, height: 12, borderRadius: 6, background: theme.muted, opacity: 0.7 }} />
              <div style={{ width: 44, height: 12, borderRadius: 6, background: theme.accent2, opacity: 0.9 }} />
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontFamily: theme.font, fontWeight: 900, fontSize: 52, color: theme.accent2, marginTop: 12, letterSpacing: 3 }}>SERVER</div>
      </div>

      {/* packet 1 SYN SEQ 42 */}
      <div style={{ position: "absolute", left: p1cx - 130 + Math.sin(frame / 10) * 4, top: wireY - 148, width: 260, height: 112, borderRadius: 20, border: `5px solid ${theme.accent}`, background: "#08131C", boxShadow: `0 0 30px ${theme.accent}`, opacity: p1op, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 58, color: theme.accent, lineHeight: 1 }}>✉ SYN</div>
        <div style={{ fontFamily: theme.mono, fontWeight: 800, fontSize: 38, color: "#fff" }}>SEQ 42</div>
      </div>

      {/* packet 2 SYN SEQ 100 ACK 43 */}
      <div style={{ position: "absolute", left: p2cx - 150 + Math.sin(frame / 10 + 1) * 4, top: wireY - 168, width: 300, height: 132, borderRadius: 20, border: `5px solid ${theme.accent2}`, background: "#190B1A", boxShadow: `0 0 32px ${theme.accent2}`, opacity: p2op, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 50, color: theme.accent2, lineHeight: 1 }}>✉ SYN-ACK</div>
        <div style={{ fontFamily: theme.mono, fontWeight: 800, fontSize: 34, color: "#fff" }}>100 · ACK 43</div>
      </div>

      {/* packet 3 ACK 101 */}
      <div style={{ position: "absolute", left: p3xShow - 110, top: wireY - 140 + Math.sin(frame / 9) * 4, width: 220, height: 104, borderRadius: 20, border: `5px solid ${theme.accent3}`, background: "#1A1608", boxShadow: `0 0 30px ${theme.accent3}`, opacity: p3op, transform: `scale(${0.4 + 0.6 * Math.max(p3form, p3travel)})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 54, color: theme.accent3, lineHeight: 1 }}>✉ ACK</div>
        <div style={{ fontFamily: theme.mono, fontWeight: 800, fontSize: 38, color: "#fff" }}>101</div>
      </div>

      {/* starting at 42 note */}
      <Appear at={sec(8.78)} outAt={sec(11.95)} dy={24} style={{ position: "absolute", left: 0, top: 1190, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: 56, color: theme.fg }}>starting at <span style={{ color: theme.accent }}>42</span></div>
      </Appear>

      {/* bottom step line */}
      <div style={{ position: "absolute", left: 0, top: 1300, width: "100%", textAlign: "center" }}>
        <div style={{ display: "inline-block", fontFamily: theme.font, fontWeight: 900, fontSize: 54, color: stepColor, background: "rgba(0,0,0,0.55)", border: `4px solid ${stepColor}`, borderRadius: 999, padding: "12px 42px", transform: isLocked ? `scale(${0.7 + 0.3 * popLock})` : "scale(1)", boxShadow: `0 0 26px ${stepColor}` }}>{isLocked ? "🔒 LOCKED ✓" : stepText}</div>
      </div>
    </AbsoluteFill>
  );
}