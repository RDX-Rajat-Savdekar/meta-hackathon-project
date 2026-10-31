import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme, sec } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();

  const LAP_X = 270;
  const SERV_X = 810;
  const LINE_Y = 768;

  // Beats
  const bBright = sec(0.68);
  const bP1 = sec(1.6);
  const bP2 = sec(2.26);
  const bP3 = sec(2.54);

  // Line brightens muted -> white starting at 0.68
  const lineBright = interpolate(frame, [bBright, sec(1.1)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Title kinetic scale starting at 0.68
  const titleBase = interpolate(frame, [bBright, sec(1.1)], [1, 1.14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bump2 = interpolate(frame, [bP2, bP2 + 6, bP2 + 14], [0, 0.07, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bump3 = interpolate(frame, [bP3, bP3 + 5, bP3 + 12], [0, 0.07, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = titleBase + bump2 + bump3;
  const titleGlow = interpolate(frame, [bBright, sec(1.2)], [0.25, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulses: staggered so all three overlap around f80
  const p1Dur = 26;
  const p2Dur = 18;
  const p3Dur = 12;
  const p1Prog = interpolate(frame, [bP1, bP1 + p1Dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p2Prog = interpolate(frame, [bP2, bP2 + p2Dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p3Prog = interpolate(frame, [bP3, bP3 + p3Dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p1X = LAP_X + (SERV_X - LAP_X) * p1Prog;
  const p2X = SERV_X + (LAP_X - SERV_X) * p2Prog;
  const p3X = LAP_X + (SERV_X - LAP_X) * p3Prog;

  const p1Op =
    frame < bP1
      ? 0
      : interpolate(frame, [bP1 + p1Dur, bP1 + p1Dur + 9], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const p2Op =
    frame < bP2
      ? 0
      : interpolate(frame, [bP2 + p2Dur, bP2 + p2Dur + 9], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const p3Op =
    frame < bP3
      ? 0
      : interpolate(frame, [bP3 + p3Dur, bP3 + p3Dur + 9], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  // Node flashes starting exactly on beats
  const lapFlash1 = interpolate(frame, [bP1, bP1 + 6, bP1 + 16], [0, 0.32, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lapFlash2 = interpolate(frame, [bP3, bP3 + 6, bP3 + 14], [0, 0.24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const servFlash = interpolate(frame, [bP2, bP2 + 6, bP2 + 16], [0, 0.32, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const idle = 0.025 * Math.sin(frame * 0.22);
  const lapScale = 1 + lapFlash1 + lapFlash2 + idle;
  const servScale = 1 + servFlash - idle;

  // Knock ripples on arrival
  const r1Start = bP1 + p1Dur;
  const r2Start = bP2 + p2Dur;
  const r3Start = bP3 + p3Dur;
  const r1Prog = interpolate(frame, [r1Start, r1Start + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const r2Prog = interpolate(frame, [r2Start, r2Start + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const r3Prog = interpolate(frame, [r3Start, r3Start + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const r1Op = frame < r1Start ? 0 : 1 - r1Prog;
  const r2Op = frame < r2Start ? 0 : 1 - r2Prog;
  const r3Op = frame < r3Start ? 0 : 1 - r3Prog;

  const dotPulse = 0.5 + 0.5 * Math.sin(frame * 0.35);

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      {/* connecting line */}
      <div
        style={{
          position: "absolute",
          left: LAP_X,
          top: LINE_Y - 4,
          width: SERV_X - LAP_X,
          height: 8,
          borderRadius: 4,
          background: theme.muted,
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: LAP_X,
          top: LINE_Y - 5,
          width: SERV_X - LAP_X,
          height: 10,
          borderRadius: 5,
          background: theme.fg,
          opacity: lineBright * (0.75 + 0.25 * dotPulse),
          boxShadow: `0 0 24px rgba(255,255,255,${0.7 * lineBright})`,
        }}
      />

      {/* pulses */}
      {p1Op > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: p1X - 22,
            top: LINE_Y - 22,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: theme.accent,
            boxShadow: `0 0 24px ${theme.accent}, 0 0 70px ${theme.accent}`,
            opacity: p1Op,
          }}
        />
      )}
      {p2Op > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: p2X - 22,
            top: LINE_Y - 22,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: theme.accent2,
            boxShadow: `0 0 24px ${theme.accent2}, 0 0 70px ${theme.accent2}`,
            opacity: p2Op,
          }}
        />
      )}
      {p3Op > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: p3X - 20,
            top: LINE_Y - 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            background: theme.accent3,
            boxShadow: `0 0 24px ${theme.accent3}, 0 0 70px ${theme.accent3}`,
            opacity: p3Op,
          }}
        />
      )}

      {/* knock ripples */}
      {r1Op > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: SERV_X - (90 + 75 * r1Prog),
            top: LINE_Y - (90 + 75 * r1Prog),
            width: (90 + 75 * r1Prog) * 2,
            height: (90 + 75 * r1Prog) * 2,
            borderRadius: 999,
            border: `5px solid ${theme.accent}`,
            opacity: r1Op,
          }}
        />
      )}
      {r2Op > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: LAP_X - (90 + 75 * r2Prog),
            top: LINE_Y - (90 + 75 * r2Prog),
            width: (90 + 75 * r2Prog) * 2,
            height: (90 + 75 * r2Prog) * 2,
            borderRadius: 999,
            border: `5px solid ${theme.accent2}`,
            opacity: r2Op,
          }}
        />
      )}
      {r3Op > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: SERV_X - (90 + 75 * r3Prog),
            top: LINE_Y - (90 + 75 * r3Prog),
            width: (90 + 75 * r3Prog) * 2,
            height: (90 + 75 * r3Prog) * 2,
            borderRadius: 999,
            border: `5px solid ${theme.accent3}`,
            opacity: r3Op,
          }}
        />
      )}

      {/* LAPTOP node */}
      <div
        style={{
          position: "absolute",
          left: LAP_X - 95,
          top: LINE_Y - 95,
          width: 190,
          height: 190,
          transform: `scale(${lapScale})`,
        }}
      >
        <div
          style={{
            width: 190,
            height: 190,
            borderRadius: 95,
            background: "rgba(0,229,255,0.14)",
            border: `5px solid ${theme.accent}`,
            boxShadow: `0 0 38px ${theme.accent}, 0 0 90px rgba(0,229,255,0.55)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              width: 74,
              height: 48,
              border: "7px solid #fff",
              borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div style={{ width: 92, height: 10, background: "#fff", borderRadius: 5, marginTop: 6 }} />
        </div>
        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            color: theme.fg,
            fontFamily: theme.font,
            fontWeight: 800,
            fontSize: 48,
            letterSpacing: 5,
          }}
        >
          LAPTOP
        </div>
      </div>

      {/* SERVER node */}
      <div
        style={{
          position: "absolute",
          left: SERV_X - 95,
          top: LINE_Y - 95,
          width: 190,
          height: 190,
          transform: `scale(${servScale})`,
        }}
      >
        <div
          style={{
            width: 190,
            height: 190,
            borderRadius: 95,
            background: "rgba(255,45,248,0.14)",
            border: `5px solid ${theme.accent2}`,
            boxShadow: `0 0 38px ${theme.accent2}, 0 0 90px rgba(255,45,248,0.55)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 76,
                height: 24,
                border: "4px solid #fff",
                borderRadius: 6,
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingLeft: 8,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 4, background: "#fff" }} />
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            color: theme.fg,
            fontFamily: theme.font,
            fontWeight: 800,
            fontSize: 48,
            letterSpacing: 5,
          }}
        >
          SERVER
        </div>
      </div>

      {/* Title band at 55% height */}
      <div
        style={{
          position: "absolute",
          top: 930,
          width: "100%",
          textAlign: "center",
          transform: `scale(${titleScale})`,
        }}
      >
        <div
          style={{
            color: theme.fg,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 108,
            letterSpacing: 6,
            lineHeight: 1,
            textShadow: `0 0 ${30 + 40 * titleGlow}px rgba(255,255,255,0.55)`,
          }}
        >
          3 KNOCKS
        </div>
        <div
          style={{
            margin: "22px auto 0px auto",
            width: 420 + 120 * lineBright,
            height: 12,
            borderRadius: 6,
            background: theme.accent,
            boxShadow: `0 0 28px ${theme.accent}`,
            opacity: 0.5 + 0.5 * lineBright,
          }}
        />
      </div>
    </AbsoluteFill>
  );
}