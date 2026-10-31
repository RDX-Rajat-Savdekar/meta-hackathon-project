import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme, sec, useSpringAt, Title, Appear } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();
  const lockS = useSpringAt(sec(0.91));
  const bubS = useSpringAt(sec(3.35));
  const stampS = useSpringAt(sec(4.93));
  const tagS = useSpringAt(sec(5.23));

  const fLock = sec(0.91);
  const fSpeed = sec(1.45);
  const fBubbles = sec(3.35);
  const fMerge = sec(4.93);
  const fTag = sec(5.23);

  const drop = (1 - lockS) * -680;
  const lockTop = 586 + drop;
  const lockRot =
    frame < fLock + 12 ? 0 : Math.sin((frame - fLock) * 0.25) * 3;

  const flash = interpolate(frame, [fLock + 10, fLock + 22], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stock = frame < fLock + 10 ? 1 : 0;

  const firstX = interpolate(frame, [sec(0.2), sec(1.45) + 15], [90, 670], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const firstY = 862 + Math.sin(frame * 0.15) * 8;
  const secondX = 882;
  const secondY = 862 + Math.cos(frame * 0.15) * 8;

  const speedIn = interpolate(frame, [fSpeed, fSpeed + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const speedOut = interpolate(frame, [sec(2.8), sec(3.2)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const speedOp = speedIn * (1 - speedOut);

  const mergeT = interpolate(frame, [fMerge, fMerge + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bubOpIn = interpolate(frame, [fBubbles, fBubbles + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bubOpOut = interpolate(frame, [fMerge + 8, fMerge + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bubOp = bubOpIn * (1 - bubOpOut);

  const b1X = interpolate(frame, [fMerge, fMerge + 14], [670, 540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const b1Y = interpolate(frame, [fMerge, fMerge + 14], [640, 1130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const b2X = interpolate(frame, [fMerge, fMerge + 14], [882, 540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const b2Y = interpolate(frame, [fMerge, fMerge + 14], [640, 1130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = 0.35 + 0.2 * Math.sin(frame * 0.18);
  const queueDashOp = 0.5 + 0.3 * Math.sin(frame * 0.3);

  const bubScale = Math.max(0.01, bubS * (1 - mergeT * 0.6));
  const stampScale = Math.max(0.01, stampS);
  const tagScale = Math.max(0.01, tagS);

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      {/* ambient glow */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 620,
          width: 800,
          height: 420,
          borderRadius: 220,
          background: theme.accent,
          opacity: glowPulse * 0.16,
          filter: "blur(90px)",
        }}
      />

      <Title text="Without that lock" at={0} size={88} y={220} />

      <Appear
        at={fSpeed}
        style={{ position: "absolute", top: 350, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 72,
            color: theme.accent,
          }}
        >
          speed creates lies.
        </div>
      </Appear>

      {/* dashed queue line behind lock */}
      <div
        style={{
          position: "absolute",
          left: 560,
          top: 886,
          width: 420,
          height: 0,
          borderTop: `6px dashed ${theme.muted}`,
          opacity: queueDashOp,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 566,
          top: 910,
          width: "100%",
          fontFamily: theme.mono,
          fontSize: 48,
          fontWeight: 800,
          color: theme.muted,
          opacity: queueDashOp,
        }}
      >
        QUEUE
      </div>

      {/* speed lines */}
      <div style={{ position: "absolute", top: 770, left: 0, width: 1080, height: 200, opacity: speedOp }}>
        {[0, 1, 2, 3].map((i) => {
          const y = 790 + i * 38;
          const slide = ((frame * 34 + i * 170) % 360) - 120;
          const isMag = i > 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: (isMag ? 560 : 60) + slide * 0.4,
                width: 150 - i * 18,
                height: 10,
                borderRadius: 8,
                background: isMag ? theme.accent2 : theme.accent,
                opacity: 0.9,
              }}
            />
          );
        })}
      </div>

      {/* center database row */}
      <div
        style={{
          position: "absolute",
          top: 762,
          left: 180,
          width: 720,
          height: 200,
          borderRadius: 28,
          border: `7px solid ${theme.accent}`,
          background: "#062028",
          boxShadow: `0 0 60px ${theme.accent}55`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontFamily: theme.mono, fontSize: 48, fontWeight: 800, color: theme.muted }}>
          DATABASE ROW
        </div>
        <div style={{ fontFamily: theme.font, fontSize: 84, fontWeight: 900, color: theme.fg, lineHeight: 1 }}>
          stock = {stock}
        </div>
        {/* metallic flash */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            borderRadius: 22,
            background: "#fff",
            opacity: flash * 0.85,
          }}
        />
      </div>

      {/* red SOLD OUT banner slam over row */}
      {frame >= fTag - 2 && (
        <div
          style={{
            position: "absolute",
            top: 818,
            left: 140,
            width: 800,
            height: 84,
            background: "#FF2222",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `rotate(-6deg) scale(${tagScale})`,
            opacity: interpolate(frame, [fTag, fTag + 3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            boxShadow: "0 10px 40px rgba(255,34,34,0.6)",
          }}
        >
          <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 64, color: "#fff" }}>
            SOLD OUT
          </div>
        </div>
      )}

      {/* steel padlock dropping from above */}
      <div
        style={{
          position: "absolute",
          left: 440,
          top: lockTop,
          width: 200,
          height: 250,
          transform: `rotate(${lockRot}deg)`,
        }}
      >
        <div
          style={{
            marginLeft: 35,
            width: 130,
            height: 95,
            border: `20px solid ${theme.fg}`,
            borderBottom: "none",
            borderTopLeftRadius: 70,
            borderTopRightRadius: 70,
            background: "transparent",
          }}
        />
        <div
          style={{
            width: 200,
            height: 155,
            borderRadius: 28,
            background: theme.fg,
            border: `6px solid #9aa7b5`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            boxShadow: `0 0 ${20 + flash * 70}px rgba(255,255,255,${0.4 + flash * 0.6})`,
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 20, background: "#0b1116" }} />
          <div style={{ width: 18, height: 44, background: "#0b1116", marginTop: -6, borderRadius: 6 }} />
        </div>
      </div>

      {/* FIRST request dot - passes through */}
      <div
        style={{
          position: "absolute",
          left: firstX - 46,
          top: firstY - 46,
          width: 92,
          height: 92,
          borderRadius: 50,
          background: theme.accent,
          boxShadow: `0 0 34px ${theme.accent}`,
          border: "6px solid #fff",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: firstX - 110,
          top: firstY + 54,
          width: 220,
          textAlign: "center",
          fontFamily: theme.font,
          fontWeight: 900,
          fontSize: 48,
          color: theme.accent,
        }}
      >
        FIRST
      </div>

      {/* SECOND request dot - waits */}
      <div
        style={{
          position: "absolute",
          left: secondX - 46,
          top: secondY - 46,
          width: 92,
          height: 92,
          borderRadius: 50,
          background: theme.accent2,
          boxShadow: `0 0 34px ${theme.accent2}`,
          border: "6px dashed #fff",
          opacity: 0.95,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: secondX - 130,
          top: secondY + 54,
          width: 260,
          textAlign: "center",
          fontFamily: theme.font,
          fontWeight: 900,
          fontSize: 48,
          color: theme.accent2,
        }}
      >
        SECOND
      </div>

      {/* two true bubbles */}
      {frame >= fBubbles - 2 && (
        <React.Fragment>
          <div
            style={{
              position: "absolute",
              left: b1X,
              top: b1Y,
              width: 360,
              padding: "18px 10px",
              background: theme.fg,
              borderRadius: 32,
              textAlign: "center",
              transform: `translate(-50%,-100%) scale(${bubScale})`,
              opacity: bubOp,
            }}
          >
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 52, color: "#0b1116" }}>
              true: 1 left
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: b2X,
              top: b2Y,
              width: 360,
              padding: "18px 10px",
              background: theme.fg,
              borderRadius: 32,
              textAlign: "center",
              transform: `translate(-50%,-100%) scale(${bubScale})`,
              opacity: bubOp,
            }}
          >
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 52, color: "#0b1116" }}>
              true: 1 left
            </div>
          </div>
        </React.Fragment>
      )}

      {/* merged FICTION stamp */}
      {frame >= fMerge && (
        <div
          style={{
            position: "absolute",
            top: 1090,
            left: 140,
            width: 800,
            padding: "22px 0",
            border: `10px solid ${theme.accent2}`,
            borderRadius: 24,
            background: "rgba(255,0,180,0.16)",
            textAlign: "center",
            transform: `rotate(-8deg) scale(${stampScale})`,
            boxShadow: `0 0 50px ${theme.accent2}88`,
          }}
        >
          <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 96, color: theme.accent2, lineHeight: 1 }}>
            FICTION
          </div>
          <div style={{ fontFamily: theme.mono, fontWeight: 800, fontSize: 52, color: theme.fg }}>
            x2 sold
          </div>
        </div>
      )}

      {/* expensive yellow tag */}
      {frame >= fTag - 2 && (
        <div
          style={{
            position: "absolute",
            top: 1330,
            left: 560,
            width: 420,
            height: 92,
            background: theme.accent3,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `rotate(10deg) scale(${tagScale})`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 52, color: "#111" }}>
            $$$ EXPENSIVE
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}