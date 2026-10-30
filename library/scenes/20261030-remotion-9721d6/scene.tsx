import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { theme, sec, ramp } from "@kit";

const BIT_VALUES = ["0", "1", "1", "0", "1", "1"];
const BEADS = [
  { letter: "C", bits: "01", color: "#00D8FF" },
  { letter: "G", bits: "10", color: "#FF2FB3" },
  { letter: "T", bits: "11", color: "#FFD400" },
];
const CARD_DEFS = [
  { letter: "A", bits: "00", color: "#22C55E", at: 4.06 },
  { letter: "C", bits: "01", color: "#00D8FF", at: 5.66 },
  { letter: "G", bits: "10", color: "#FF2FB3", at: 7.12 },
  { letter: "T", bits: "11", color: "#FFD400", at: 7.12 },
];
const BEAD_CX = [310, 540, 770];

export default function Scene() {
  const frame = useCurrentFrame();

  const bA = sec(4.06);
  const bC = sec(5.66);
  const bG = sec(7.12);
  const bBits = sec(9.8);
  const bSplit = sec(13.06);
  const bCpair = sec(15.44);
  const bGpair = sec(16.98);
  const bTpair = sec(18.34);
  const pm0 = sec(22.5);
  const printEnd = pm0 + 76;
  const scanStart = pm0 + 88;
  const scanEnd = scanStart + 62;

  const splitProg = interpolate(frame, [bSplit, bSplit + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headOpIn = interpolate(frame, [pm0, pm0 + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headOpOut = interpolate(frame, [scanStart - 12, scanStart], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headOp = headOpIn * headOpOut;
  const headX = interpolate(frame, [pm0, printEnd], [140, 920], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headBob = Math.sin(frame * 0.3) * 5;

  const scanOp = interpolate(frame, [scanStart, scanStart + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanX = interpolate(frame, [scanStart, scanEnd], [920, 150], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanGlow = 0.6 + Math.sin(frame * 0.35) * 0.4;

  const labelTopOp = ramp(frame, 0, 15);
  const sixOp =
    interpolate(frame, [bBits, bBits + 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    (1 -
      interpolate(frame, [bSplit, bSplit + 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }));
  const pairOp = interpolate(frame, [bSplit, bSplit + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bracketFade =
    1 -
    interpolate(frame, [bCpair, bCpair + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      {/* ambient drift */}
      <div
        style={{
          position: "absolute",
          left: 120 + Math.sin(frame * 0.02) * 40,
          top: 420 + Math.cos(frame * 0.017) * 30,
          width: 420,
          height: 420,
          borderRadius: 999,
          background: "#00D8FF",
          opacity: 0.07,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 620 + Math.cos(frame * 0.022) * 40,
          top: 900 + Math.sin(frame * 0.019) * 30,
          width: 460,
          height: 460,
          borderRadius: 999,
          background: "#FF2FB3",
          opacity: 0.06,
        }}
      />

      {/* top label */}
      <div
        style={{
          position: "absolute",
          top: 208,
          width: "100%",
          textAlign: "center",
          fontFamily: theme.font,
          fontWeight: 800,
          fontSize: 48,
          letterSpacing: 4,
          color: theme.muted,
          opacity: labelTopOp,
        }}
      >
        EACH LETTER = 2 BITS
      </div>

      {/* mapping cards */}
      <div
        style={{
          position: "absolute",
          top: 300,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {CARD_DEFS.map((c, i) => {
          const at = sec(c.at);
          const fade = ramp(frame, i * 6, 16);
          const lit = interpolate(frame, [at, at + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const lift = interpolate(frame, [at, at + 12], [0, -30], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const pop = spring({ frame: Math.max(0, frame - at), fps: 30, config: { damping: 12 } });
          const popScale = frame < at ? 1 : 1 + Math.max(0, pop - 1) * 0.4 + lit * 0.06;
          const float = Math.sin((frame + i * 18) * 0.09) * 4 * lit;
          return (
            <div
              key={c.letter}
              style={{
                width: 220,
                height: 284,
                borderRadius: 28,
                opacity: fade,
                transform: `translateY(${lift + float}px) scale(${popScale})`,
                background: "#15181F",
                border: `5px solid ${lit > 0.5 ? c.color : "#2E3440"}`,
                boxShadow:
                  lit > 0.02
                    ? `0 0 ${Math.round(10 + lit * 46)}px ${c.color}`
                    : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: c.color,
                  opacity: lit * 0.92,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#FFFFFF",
                  opacity: lit * (0.06 + Math.sin(frame * 0.2 + i) * 0.03),
                }}
              />
              <div
                style={{
                  fontFamily: theme.font,
                  fontWeight: 900,
                  fontSize: 104,
                  lineHeight: 1,
                  color: "#FFFFFF",
                  zIndex: 1,
                }}
              >
                {c.letter}
              </div>
              <div
                style={{
                  fontFamily: theme.mono,
                  fontWeight: 800,
                  fontSize: 54,
                  color: "#FFFFFF",
                  zIndex: 1,
                  marginTop: 6,
                  opacity: 0.35 + lit * 0.65,
                }}
              >
                {c.bits}
              </div>
            </div>
          );
        })}
      </div>

      {/* middle labels */}
      <div
        style={{
          position: "absolute",
          top: 632,
          width: "100%",
          textAlign: "center",
          fontFamily: theme.font,
          fontWeight: 900,
          fontSize: 56,
          color: theme.fg,
          opacity: sixOp,
        }}
      >
        SIX BITS
      </div>
      <div
        style={{
          position: "absolute",
          top: 632,
          width: "100%",
          textAlign: "center",
          fontFamily: theme.font,
          fontWeight: 900,
          fontSize: 56,
          color: theme.accent3,
          opacity: pairOp,
        }}
      >
        THREE PAIRS
      </div>

      {/* pair brackets */}
      {[0, 1, 2].map((p) => {
        const snapAt = bSplit + p * 4;
        const snap = interpolate(frame, [snapAt, snapAt + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const snapY = interpolate(frame, [snapAt, snapAt + 10], [-42, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const off = (p - 1) * 54 * splitProg;
        const left = 136 + p * 2 * 138 + off - 14;
        return (
          <div
            key={p}
            style={{
              position: "absolute",
              top: 706 + snapY,
              left,
              width: 282,
              height: 168,
              borderRadius: 26,
              border: "6px solid #6B7280",
              borderBottomWidth: 10,
              opacity: snap * bracketFade,
            }}
          />
        );
      })}

      {/* six bit tiles flying */}
      {BIT_VALUES.map((v, i) => {
        const pair = Math.floor(i / 2);
        const flyStarts = [bCpair, bGpair, bTpair];
        const flyStart = flyStarts[pair];
        const flyP = interpolate(frame, [flyStart, flyStart + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const entryAt = bBits + i * 6;
        const entryOp = interpolate(frame, [entryAt, entryAt + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const entryDy = interpolate(frame, [entryAt, entryAt + 12], [90, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const flyFade = interpolate(frame, [flyStart + 10, flyStart + 18], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const baseLeft = 136 + i * 138;
        const off = (pair - 1) * 54 * splitProg;
        const initLeft = baseLeft + off;
        const targetLeft = BEAD_CX[pair] - 59;
        const left = initLeft * (1 - flyP) + targetLeft * flyP;
        const topBase = 730 * (1 - flyP) + 1058 * flyP + entryDy * (1 - flyP);
        const float = Math.sin((frame + i * 14) * 0.1) * 5 * (1 - flyP) * entryOp;
        const sc = (1 - flyP * 0.25) * (0.6 + entryOp * 0.4);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top: topBase + float,
              width: 118,
              height: 118,
              borderRadius: 26,
              background: "#FFFFFF",
              boxShadow: "0 0 28px rgba(255,255,255,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.mono,
              fontWeight: 900,
              fontSize: 72,
              color: "#0B0D12",
              opacity: entryOp * flyFade,
              transform: `scale(${sc})`,
            }}
          >
            {v}
          </div>
        );
      })}

      {/* strand slot track */}
      <div
        style={{
          position: "absolute",
          top: 1030,
          left: 110,
          width: 860,
          height: 216,
          borderRadius: 40,
          background: "#12151C",
          border: "4px solid #2E3440",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 1124,
          left: 150,
          width: 780,
          height: 28,
          borderRadius: 999,
          background: "#232833",
        }}
      />
      {/* empty slot outlines */}
      {BEAD_CX.map((cx, i) => (
        <div
          key={"slot" + i}
          style={{
            position: "absolute",
            top: 1052,
            left: cx - 86,
            width: 172,
            height: 172,
            borderRadius: 36,
            border: "4px dashed #3A4150",
            opacity: 0.9,
          }}
        />
      ))}

      {/* CGT bead blocks */}
      {BEADS.map((b, i) => {
        const blockAt = [bCpair, bGpair, bTpair][i] + 14;
        const earlyOp = interpolate(frame, [blockAt, blockAt + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const earlySc = interpolate(frame, [blockAt, blockAt + 8, blockAt + 18], [0, 1.22, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const rebuildAt = pm0 + 12 + i * 24;
        const rebuildOp = interpolate(frame, [rebuildAt, rebuildAt + 10], [0.12, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const rebuildSc = interpolate(frame, [rebuildAt, rebuildAt + 12], [0.3, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isRebuild = frame >= pm0;
        const op = isRebuild ? rebuildOp * Math.max(earlyOp, 0.2) : earlyOp;
        const scBase = isRebuild ? rebuildSc : Math.max(earlySc, 0.001);
        const pulse = 1 + Math.sin(frame * 0.18 + i * 2) * 0.035;
        const sc = Math.max(0.001, scBase * pulse);
        return (
          <div
            key={b.letter}
            style={{
              position: "absolute",
              top: 1052,
              left: BEAD_CX[i] - 86,
              width: 172,
              height: 172,
              borderRadius: 36,
              background: b.color,
              boxShadow: `0 0 ${Math.round(18 + scanGlow * 22)}px ${b.color}`,
              opacity: op,
              transform: `scale(${sc})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 88, lineHeight: 1, color: "#fff" }}>
              {b.letter}
            </div>
            <div style={{ fontFamily: theme.mono, fontWeight: 800, fontSize: 42, color: "#fff" }}>{b.bits}</div>
          </div>
        );
      })}

      {/* printer head */}
      <div style={{ position: "absolute", top: 872 + headBob, left: headX - 78, opacity: headOp, width: 156, height: 120 }}>
        <div
          style={{
            width: 156,
            height: 84,
            borderRadius: 20,
            background: "#9AA0AE",
            border: "4px solid #5B616E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 48,
            color: "#1A1E26",
          }}
        >
          ▦
        </div>
        <div style={{ width: 36, height: 26, background: "#5B616E", marginLeft: 60, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }} />
        <div
          style={{
            position: "absolute",
            top: -58,
            left: 8,
            background: "#fff",
            color: "#111",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 48,
            padding: "4px 22px",
            borderRadius: 999,
          }}
        >
          BUILD
        </div>
      </div>

      {/* scanner bar */}
      <div
        style={{
          position: "absolute",
          top: 1016,
          left: scanX - 10,
          width: 20,
          height: 250,
          borderRadius: 999,
          background: theme.accent,
          boxShadow: `0 0 ${Math.round(20 + scanGlow * 30)}px ${theme.accent}`,
          opacity: scanOp,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 962,
          left: scanX - 78,
          opacity: scanOp,
          background: theme.accent,
          color: "#061014",
          fontFamily: theme.font,
          fontWeight: 900,
          fontSize: 48,
          padding: "4px 26px",
          borderRadius: 999,
        }}
      >
        READ
      </div>

      {/* white bits below strand revealed by scanner */}
      {[0, 1, 2].map((bi) => {
        const revealAt = scanStart + (2 - bi) * 22 + 8;
        const op = interpolate(frame, [revealAt, revealAt + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const sc = interpolate(frame, [revealAt, revealAt + 10, revealAt + 20], [0.4, 1.18, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const dy = interpolate(frame, [revealAt, revealAt + 10], [34, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const vals = bi === 0 ? ["0", "1"] : bi === 1 ? ["1", "0"] : ["1", "1"];
        return (
          <div key={"below" + bi} style={{ position: "absolute", top: 1296 + dy, left: BEAD_CX[bi] - 82, display: "flex", gap: 12, opacity: op, transform: `scale(${Math.max(0.001, sc)})` }}>
            {vals.map((vv, j) => (
              <div
                key={j}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 18,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: theme.mono,
                  fontWeight: 900,
                  fontSize: 52,
                  color: "#0B0D12",
                  boxShadow: "0 0 18px rgba(255,255,255,0.7)",
                }}
              >
                {vv}
              </div>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}