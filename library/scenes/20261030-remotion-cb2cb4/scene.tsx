import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, sec, Appear } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fLaptop = sec(0.53);
  const fSync = sec(1.43);
  const fSeq100 = sec(4.99);
  const fServer = sec(6.37);
  const fSynAck = sec(10.31);
  const fConfirm = sec(11.17);
  const fAck = sec(13.99);
  const fLock = sec(16.91);
  const fBytes = sec(19.97);
  const fMissing = sec(22.25);

  const bob = Math.sin((frame / fps) * 2.2) * 8;
  const pulseFast = 0.5 + 0.5 * Math.sin((frame / fps) * 9);

  // Arrow progresses
  const p1 = interpolate(frame, [sec(1.43), sec(4.4)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x1 = interpolate(p1, [0, 1], [190, 700], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p2 = interpolate(frame, [sec(10.31), sec(12.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x2 = interpolate(p2, [0, 1], [700, 190], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p3 = interpolate(frame, [sec(13.99), sec(16.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x3 = interpolate(p3, [0, 1], [190, 700], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const arrow1Op = interpolate(frame, [fLaptop, sec(0.9)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - interpolate(frame, [sec(6.0), sec(6.37)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const arrow2Op = interpolate(frame, [fServer, sec(6.7)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - interpolate(frame, [sec(13.5), sec(13.99)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const arrow3Op = interpolate(frame, [fAck, sec(14.3)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - interpolate(frame, [sec(19.2), sec(19.97)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const laptopActive = frame >= fLaptop && frame < fServer;
  const serverActive = frame >= fServer && frame < sec(10.0);
  const locked = frame >= fLock;

  const laptopBorder = locked ? theme.good : laptopActive ? theme.accent : "#334155";
  const serverBorder = locked ? theme.good : serverActive ? theme.accent2 : "#334155";

  const leftCounterVisible = frame >= fSeq100;
  const rightCounterVisible = frame >= fSynAck;

  const slideBytes = interpolate(frame, [fBytes, sec(21.6)], [-140, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const driftBytes = interpolate(frame, [fBytes, sec(23.8)], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drop103 = interpolate(frame, [fMissing, sec(22.75)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gapPop = interpolate(frame, [fMissing, sec(22.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const shimmer = interpolate(frame, [sec(0), sec(1.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.font, overflow: "hidden" }}>
      {/* faint corridor */}
      <div style={{ position: "absolute", left: 170, top: 830, width: 740, height: 210, borderRadius: 32, border: "3px dashed #263245", background: "#0B1220", opacity: 0.9 + shimmer * 0.1 }} />
      <div style={{ position: "absolute", left: 170, top: 940, width: 740, height: 6, background: "#1E293B", opacity: 0.6 + pulseFast * 0.25 }} />

      {/* header band */}
      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center" }}>
        <div style={{ color: theme.muted, fontWeight: 800, fontSize: 48, letterSpacing: 6 }}>3-WAY HANDSHAKE</div>
      </div>

      {/* LEFT LAPTOP */}
      <div style={{ position: "absolute", left: 54, top: 656 + bob * 0.4, width: 280, height: 300, borderRadius: 28, background: "#111827", border: `5px solid ${laptopBorder}`, boxShadow: laptopActive ? `0 0 40px ${theme.accent}` : locked ? `0 0 30px ${theme.good}` : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 108, lineHeight: 1 }}>💻</div>
        <div style={{ color: theme.fg, fontWeight: 900, fontSize: 52, marginTop: 8 }}>LAPTOP</div>
        {laptopActive && <div style={{ color: theme.accent, fontWeight: 900, fontSize: 40, marginTop: 4 }}>● SENDING</div>}
      </div>

      {/* RIGHT SERVER */}
      <div style={{ position: "absolute", left: 746, top: 656 - bob * 0.4, width: 280, height: 300, borderRadius: 28, background: "#111827", border: `5px solid ${serverBorder}`, boxShadow: serverActive ? `0 0 40px ${theme.accent2}` : locked ? `0 0 30px ${theme.good}` : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 108, lineHeight: 1 }}>🗄️</div>
        <div style={{ color: theme.fg, fontWeight: 900, fontSize: 52, marginTop: 8 }}>SERVER</div>
        {serverActive && <div style={{ color: theme.accent2, fontWeight: 900, fontSize: 40, marginTop: 4 }}>● REPLYING</div>}
      </div>

      {/* LEFT COUNTER CHIP */}
      {leftCounterVisible && (
        <div style={{ position: "absolute", left: 44, top: 510, width: 300, height: 108, borderRadius: 22, background: locked ? theme.good : theme.accent3, border: `4px solid ${locked ? theme.good : theme.accent3}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: locked ? `0 0 28px ${theme.good}` : `0 0 28px ${theme.accent3}`, transform: `scale(${locked ? 1.05 : 1})` }}>
          <div style={{ color: locked ? "#06130B" : "#231A00", fontWeight: 900, fontSize: 62 }}>{locked ? "🔒 100" : "100"}</div>
        </div>
      )}
      <Appear at={fSeq100} style={{ position: "absolute", left: 44, top: 452, width: 300, textAlign: "center" }}>
        <div style={{ color: locked ? theme.good : theme.accent3, fontWeight: 900, fontSize: 48 }}>SEQ START</div>
      </Appear>

      {/* RIGHT COUNTER CHIP */}
      {rightCounterVisible && (
        <div style={{ position: "absolute", left: 736, top: 510, width: 300, height: 108, borderRadius: 22, background: locked ? theme.good : theme.accent3, border: `4px solid ${locked ? theme.good : theme.accent3}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: locked ? `0 0 28px ${theme.good}` : `0 0 28px ${theme.accent3}` }}>
          <div style={{ color: locked ? "#06130B" : "#231A00", fontWeight: 900, fontSize: 62 }}>{locked ? "🔒 300" : "300"}</div>
        </div>
      )}
      {rightCounterVisible && (
        <Appear at={fSynAck} style={{ position: "absolute", left: 736, top: 452, width: 300, textAlign: "center" }}>
          <div style={{ color: locked ? theme.good : theme.accent3, fontWeight: 900, fontSize: 48 }}>SEQ START</div>
        </Appear>
      )}

      {/* ARROW 1 left -> right cyan */}
      <div style={{ position: "absolute", left: 0, top: 860, width: 1080, opacity: arrow1Op, pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: x1, top: 0, display: "flex", alignItems: "center" }}>
          <div style={{ width: 140, height: 34, background: theme.accent, borderRadius: 8, boxShadow: `0 0 24px ${theme.accent}` }} />
          <div style={{ width: 0, height: 0, borderTop: "42px solid transparent", borderBottom: "42px solid transparent", borderLeft: `56px solid ${theme.accent}` }} />
        </div>
        <div style={{ position: "absolute", left: x1 - 10, top: 88, background: "#0B1220", border: `3px solid ${theme.accent}`, borderRadius: 16, padding: "8px 22px", color: theme.accent, fontWeight: 900, fontSize: 52 }}>SYN</div>
      </div>
      <Appear at={fSeq100} style={{ position: "absolute", top: 742, width: "100%", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: theme.accent3, color: "#231A00", fontWeight: 900, fontSize: 52, borderRadius: 20, padding: "10px 28px", boxShadow: `0 0 26px ${theme.accent3}` }}>SYN seq=100</div>
      </Appear>

      {/* ARROW 2 right -> left magenta */}
      <div style={{ position: "absolute", left: 0, top: 860, width: 1080, opacity: arrow2Op, pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: x2, top: 0, display: "flex", alignItems: "center" }}>
          <div style={{ width: 0, height: 0, borderTop: "42px solid transparent", borderBottom: "42px solid transparent", borderRight: `56px solid ${theme.accent2}` }} />
          <div style={{ width: 140, height: 34, background: theme.accent2, borderRadius: 8, boxShadow: `0 0 24px ${theme.accent2}` }} />
        </div>
        <div style={{ position: "absolute", left: x2 - 10, top: 88, background: "#0B1220", border: `3px solid ${theme.accent2}`, borderRadius: 16, padding: "8px 22px", color: theme.accent2, fontWeight: 900, fontSize: 52 }}>SYN-ACK</div>
      </div>
      {frame >= fSynAck && frame < fAck + 10 && (
        <div style={{ position: "absolute", top: 730, width: "100%", textAlign: "center", opacity: arrow2Op }}>
          <div style={{ display: "inline-block", background: theme.accent3, color: "#231A00", fontWeight: 900, fontSize: 50, borderRadius: 20, padding: "10px 28px", marginRight: 14, boxShadow: `0 0 22px ${theme.accent3}` }}>seq=300</div>
          <div style={{ display: "inline-block", background: frame >= fConfirm ? theme.good : theme.fg, color: frame >= fConfirm ? "#06130B" : "#0B1220", fontWeight: 900, fontSize: 50, borderRadius: 20, padding: "10px 28px", boxShadow: frame >= fConfirm ? `0 0 22px ${theme.good}` : "none" }}>{frame >= fConfirm ? "✓ ACK your 100" : "ACK your 100"}</div>
        </div>
      )}

      {/* ARROW 3 left -> right cyan */}
      <div style={{ position: "absolute", left: 0, top: 860, width: 1080, opacity: arrow3Op, pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: x3, top: 0, display: "flex", alignItems: "center" }}>
          <div style={{ width: 140, height: 34, background: theme.accent, borderRadius: 8, boxShadow: `0 0 24px ${theme.accent}` }} />
          <div style={{ width: 0, height: 0, borderTop: "42px solid transparent", borderBottom: "42px solid transparent", borderLeft: `56px solid ${theme.accent}` }} />
        </div>
        <div style={{ position: "absolute", left: x3 - 10, top: 88, background: "#0B1220", border: `3px solid ${theme.accent}`, borderRadius: 16, padding: "8px 22px", color: theme.accent, fontWeight: 900, fontSize: 52 }}>ACK</div>
      </div>
      {frame >= fAck && frame < fBytes && (
        <div style={{ position: "absolute", top: 730, width: "100%", textAlign: "center", opacity: arrow3Op }}>
          <div style={{ display: "inline-block", background: theme.fg, color: "#0B1220", fontWeight: 900, fontSize: 52, borderRadius: 20, padding: "10px 30px", boxShadow: "0 0 22px #fff" }}>ACK 301 ✓ your 300</div>
        </div>
      )}

      {/* LOCKED banner */}
      {locked && frame < fBytes && (
        <Appear at={fLock} style={{ position: "absolute", top: 1050, width: "100%", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: theme.good, color: "#06130B", fontWeight: 900, fontSize: 56, borderRadius: 22, padding: "12px 36px" }}>🔒 BOTH LOCKED: 100 ↔ 300</div>
        </Appear>
      )}

      {/* BYTE ROW below */}
      {frame >= fBytes && (
        <div style={{ position: "absolute", top: 1150, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ color: theme.muted, fontWeight: 800, fontSize: 48, letterSpacing: 3, marginBottom: 14 }}>NUMBERED BYTES</div>
          <div style={{ display: "flex", gap: 24, transform: `translateX(${slideBytes + driftBytes}px)` }}>
            <div style={{ width: 170, height: 120, borderRadius: 20, background: "#1E293B", border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 64 }}>101</div>
            <div style={{ width: 170, height: 120, borderRadius: 20, background: "#1E293B", border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 64 }}>102</div>
            {/* slot 103 / gap */}
            <div style={{ position: "relative", width: 170, height: 120 }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 170, height: 120, borderRadius: 20, background: "#1E293B", border: `4px dashed ${gapPop > 0.5 ? "#EF4444" : "#fff"}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 64, opacity: 1 - drop103, transform: `translateY(${drop103 * 110}px)` }}>103</div>
              <div style={{ position: "absolute", left: 0, top: 0, width: 170, height: 120, borderRadius: 20, border: "5px dashed #EF4444", background: "rgba(239,68,68,0.12)", opacity: gapPop, display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", fontWeight: 900, fontSize: 60 }}>?</div>
            </div>
          </div>
          {frame >= fMissing && (
            <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 16, opacity: gapPop, transform: `scale(${0.9 + gapPop * 0.1})` }}>
              <div style={{ width: 84, height: 84, borderRadius: 46, border: `6px solid ${theme.accent3}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, background: "#0B1220" }}>🔍</div>
              <div style={{ background: "#EF4444", color: "#fff", fontWeight: 900, fontSize: 54, borderRadius: 18, padding: "8px 26px" }}>MISSING: 103</div>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
}