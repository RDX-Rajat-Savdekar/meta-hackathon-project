import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme, sec, ramp, useSpringAt, Appear } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const cylIn = useSpringAt(sec(0.37));
  const ticketIn = useSpringAt(sec(0.67));
  const phonesIn = useSpringAt(sec(2.57));
  const magIn = useSpringAt(sec(5.33));
  const raceIn = useSpringAt(sec(7.29));

  const floatY = Math.sin(frame / 20) * 8;

  const badgePulse = interpolate(
    frame,
    [sec(0.67), sec(0.9), sec(1.2)],
    [1, 1.35, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const linesOp = ramp(frame, sec(2.57), 14);
  const writeP = ramp(frame, sec(3.05), 28);
  const readP = ramp(frame, sec(5.33), 22);

  const lx0 = 280;
  const lx1 = 400;
  const rx0 = 800;
  const rx1 = 680;
  const ly0 = 890;
  const ly1 = 850;

  const wLx = interpolate(writeP, [0, 1], [lx0, lx1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wLy = interpolate(writeP, [0, 1], [ly0, ly1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wRx = interpolate(writeP, [0, 1], [rx0, rx1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rLx = interpolate(readP, [0, 1], [lx1, lx0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rRx = interpolate(readP, [0, 1], [rx1, rx0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const showWrite = frame >= sec(3.05) && frame < sec(5.2);
  const showRead = frame >= sec(5.33) && frame < sec(6.4);

  const blink = Math.sin((frame - sec(3.05)) * 0.55);
  const buyHot = frame >= sec(3.05) && frame < sec(5.1) && blink > -0.1;

  const phoneLX = interpolate(phonesIn, [0, 1], [-360, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phoneRX = interpolate(phonesIn, [0, 1], [360, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const racePulse =
    frame >= sec(7.29) ? 1 + 0.06 * Math.sin((frame - sec(7.29)) * 0.5) : 1;
  const raceScale = Math.max(0.001, raceIn * racePulse);
  const cylGlow = 0.5 + 0.5 * Math.sin(frame / 18);

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      {/* heading band */}
      <Appear
        at={sec(0.1)}
        outAt={sec(2.5)}
        style={{ position: "absolute", top: 228, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 86,
            color: theme.fg,
            letterSpacing: -2,
          }}
        >
          ONE TICKET LEFT
        </div>
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 800,
            fontSize: 48,
            color: theme.accent,
            marginTop: 6,
          }}
        >
          count = 1 in database
        </div>
      </Appear>

      {/* connection lines */}
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          opacity: linesOp,
        }}
      >
        <line
          x1={lx0}
          y1={ly0}
          x2={lx1}
          y2={ly1}
          stroke={theme.accent}
          strokeWidth={6}
          strokeDasharray="16 12"
          strokeDashoffset={-frame * 3}
          strokeLinecap="round"
          opacity={0.9}
        />
        <line
          x1={rx0}
          y1={ly0}
          x2={rx1}
          y2={ly1}
          stroke={theme.accent2}
          strokeWidth={6}
          strokeDasharray="16 12"
          strokeDashoffset={-frame * 3}
          strokeLinecap="round"
          opacity={0.9}
        />
      </svg>

      {/* central cylinder */}
      <div
        style={{
          position: "absolute",
          left: 400,
          top: 600,
          width: 280,
          height: 380,
          transform: `scale(${Math.max(0.001, cylIn)}) translateY(${floatY}px)`,
          transformOrigin: "center 50%",
          opacity: cylIn > 0.04 ? 1 : 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 280,
            height: 96,
            borderRadius: "50%",
            background: "#0f3540",
            border: `7px solid ${theme.accent}`,
            boxSizing: "border-box",
            boxShadow: `0 0 ${30 + cylGlow * 40}px ${theme.accent}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 0,
            width: 280,
            height: 260,
            background: "rgba(34,211,238,0.20)",
            borderLeft: `7px solid ${theme.accent}`,
            borderRight: `7px solid ${theme.accent}`,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${badgePulse})`,
              boxShadow: "0 0 34px rgba(255,255,255,0.9)",
            }}
          >
            <div
              style={{
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 88,
                color: "#0b1116",
                lineHeight: 1,
              }}
            >
              1
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 0,
            width: 280,
            height: 96,
            borderRadius: "50%",
            background: "#0a222b",
            border: `7px solid ${theme.accent}`,
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -4,
            width: "100%",
            textAlign: "center",
            fontFamily: theme.mono,
            fontWeight: 800,
            fontSize: 34,
            color: theme.accent,
          }}
        >
          DB
        </div>
      </div>

      {/* ticket on top */}
      <div
        style={{
          position: "absolute",
          left: 480,
          top: 492,
          width: 130,
          height: 74,
          transform: `scale(${Math.max(0.001, ticketIn)}) rotate(-9deg) translateY(${
            Math.sin(frame / 16) * 6
          }px)`,
          transformOrigin: "center",
          opacity: ticketIn > 0.04 ? 1 : 0,
          background: theme.accent3,
          borderRadius: 14,
          border: "4px dashed #0b1116",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 28px rgba(250,204,21,0.8)",
        }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 36,
            color: "#0b1116",
          }}
        >
          1 TIX
        </div>
      </div>

      {/* LEFT PHONE */}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 700,
          width: 212,
          height: 392,
          border: `7px solid ${theme.accent}`,
          borderRadius: 34,
          background: "#0b1820",
          boxSizing: "border-box",
          transform: `translateX(${phoneLX}px)`,
          opacity: phonesIn,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 22,
        }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 38,
            color: theme.accent,
          }}
        >
          USER A
        </div>
        <div
          style={{
            marginTop: 18,
            width: 150,
            height: 150,
            borderRadius: 20,
            background: "#12262f",
            border: `3px solid ${theme.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.font,
            fontSize: 72,
            fontWeight: 900,
            color: theme.fg,
          }}
        >
          {"♪"}
        </div>
        <div
          style={{
            marginTop: 22,
            width: 160,
            height: 64,
            borderRadius: 32,
            background: buyHot ? theme.accent : "#1a3540",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 42,
            color: buyHot ? "#06222a" : theme.fg,
            boxShadow: buyHot ? `0 0 26px ${theme.accent}` : "none",
          }}
        >
          BUY
        </div>
      </div>

      {/* RIGHT PHONE */}
      <div
        style={{
          position: "absolute",
          left: 798,
          top: 700,
          width: 212,
          height: 392,
          border: `7px solid ${theme.accent2}`,
          borderRadius: 34,
          background: "#1b101d",
          boxSizing: "border-box",
          transform: `translateX(${phoneRX}px)`,
          opacity: phonesIn,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 22,
        }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 38,
            color: theme.accent2,
          }}
        >
          USER B
        </div>
        <div
          style={{
            marginTop: 18,
            width: 150,
            height: 150,
            borderRadius: 20,
            background: "#2b152e",
            border: `3px solid ${theme.accent2}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.font,
            fontSize: 72,
            fontWeight: 900,
            color: theme.fg,
          }}
        >
          {"♪"}
        </div>
        <div
          style={{
            marginTop: 22,
            width: 160,
            height: 64,
            borderRadius: 32,
            background: buyHot ? theme.accent2 : "#3a1c3e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 42,
            color: buyHot ? "#2a0a2e" : theme.fg,
            boxShadow: buyHot ? `0 0 26px ${theme.accent2}` : "none",
          }}
        >
          BUY
        </div>
      </div>

      {/* write packets phone -> db */}
      {showWrite && (
        <>
          <div
            style={{
              position: "absolute",
              left: wLx - 22,
              top: wLy - 22,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: theme.accent,
              boxShadow: `0 0 22px ${theme.accent}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: wRx - 22,
              top: wLy - 22,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: theme.accent2,
              boxShadow: `0 0 22px ${theme.accent2}`,
            }}
          />
        </>
      )}

      {/* read packets db -> phones */}
      {showRead && (
        <>
          <div
            style={{
              position: "absolute",
              left: rLx - 18,
              top: ly0 - 18,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: theme.fg,
              border: `5px solid ${theme.accent}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: rRx - 18,
              top: ly0 - 18,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: theme.fg,
              border: `5px solid ${theme.accent2}`,
            }}
          />
        </>
      )}

      {/* magnifier checks */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 560,
          width: 120,
          height: 120,
          transform: `scale(${Math.max(0.001, magIn)})`,
          opacity: magIn > 0.04 ? 1 : 0,
        }}
      >
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: "50%",
            border: `7px solid ${theme.accent}`,
            background: "rgba(34,211,238,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 900,
            color: theme.good,
            fontFamily: theme.font,
          }}
        >
          ✓
        </div>
        <div
          style={{
            position: "absolute",
            left: 66,
            top: 78,
            width: 52,
            height: 12,
            background: theme.accent,
            transform: "rotate(45deg)",
            borderRadius: 6,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 840,
          top: 560,
          width: 120,
          height: 120,
          transform: `scale(${Math.max(0.001, magIn)})`,
          opacity: magIn > 0.04 ? 1 : 0,
        }}
      >
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: "50%",
            border: `7px solid ${theme.accent2}`,
            background: "rgba(232,121,249,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 900,
            color: theme.good,
            fontFamily: theme.font,
          }}
        >
          ✓
        </div>
        <div
          style={{
            position: "absolute",
            left: 66,
            top: 78,
            width: 52,
            height: 12,
            background: theme.accent2,
            transform: "rotate(45deg)",
            borderRadius: 6,
          }}
        />
      </div>

      {/* sees 1 callouts */}
      <Appear
        at={sec(6.23)}
        style={{ position: "absolute", left: 42, top: 442, width: 270 }}
      >
        <div
          style={{
            background: theme.fg,
            borderRadius: 26,
            padding: "12px 10px",
            textAlign: "center",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 52,
            color: "#0b1116",
            border: `5px solid ${theme.accent}`,
          }}
        >
          sees 1
        </div>
      </Appear>
      <Appear
        at={sec(6.23)}
        style={{ position: "absolute", left: 768, top: 442, width: 270 }}
      >
        <div
          style={{
            background: theme.fg,
            borderRadius: 26,
            padding: "12px 10px",
            textAlign: "center",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 52,
            color: "#0b1116",
            border: `5px solid ${theme.accent2}`,
          }}
        >
          sees 1
        </div>
      </Appear>

      {/* warning banner */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 1140,
          width: 860,
          height: 140,
          transform: `scale(${raceScale})`,
          opacity: raceIn > 0.04 ? 1 : 0,
          background: theme.accent2,
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 ${30 + 26 * Math.abs(Math.sin(frame / 6))}px ${theme.accent2}`,
          border: "6px solid #fff",
        }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 68,
            color: "#fff",
            letterSpacing: 1,
          }}
        >
          RACE CONDITION
        </div>
      </div>
    </AbsoluteFill>
  );
}