import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme, sec, Appear } from "@kit";

export default function Scene() {
  const frame = useCurrentFrame();

  // Camera pullback 0.33s
  const zoom = interpolate(frame, [sec(0.33), sec(2.0)], [1.14, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Path appearance + wobble amplitude (slight -> shaky at 4.97s)
  const pathOpacity = interpolate(frame, [sec(0.33), sec(0.95)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const amp = interpolate(frame, [sec(4.97), sec(5.5)], [7, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pathY = (x: number) => {
    return 800 + amp * Math.sin((x - 210) / 90 + frame * 0.12);
  };

  let d = "";
  for (let x = 210; x <= 870; x += 12) {
    const y = pathY(x);
    d += (x === 210 ? "M " : "L ") + x + " " + y.toFixed(1) + " ";
  }

  // Ready halos from 3.19s
  const readyIn = interpolate(frame, [sec(3.19), sec(3.6)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.25);
  const haloOpacity = readyIn * (0.45 + 0.4 * pulse);
  const blink = 0.55 + 0.45 * Math.sin(frame * 0.5);
  const readyOpacity = readyIn * blink;

  // Packet A : leading, 0.95s -> lost 5.79s
  const xA = interpolate(frame, [sec(0.95), sec(7.8)], [232, 848], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const formA = interpolate(frame, [sec(0.95), sec(1.25)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const goneA = interpolate(frame, [sec(5.79), sec(6.15)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacityA = formA * goneA;
  const yA = pathY(Math.min(Math.max(xA, 210), 870));

  // Packet B : middle, starts 3.0s
  const xB = interpolate(frame, [sec(3.0), sec(9.4)], [232, 848], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacityB = interpolate(frame, [sec(3.0), sec(3.3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yB = pathY(Math.min(Math.max(xB, 210), 870));

  // Packet C : trailing, starts 4.2s, splits at 6.43s
  const xC = interpolate(frame, [sec(4.2), sec(9.2)], [232, 845], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const formC = interpolate(frame, [sec(4.2), sec(4.5)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const split = interpolate(frame, [sec(6.43), sec(6.7)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacityCwhite = formC * (1 - split);
  const opacityRed = formC * split;
  const yC = pathY(Math.min(Math.max(xC, 210), 870));
  const wob = Math.sin(frame * 0.35) * 9;
  const yC1 = yC + wob;
  const yC2 = yC - wob;

  // Packet D : late out-of-order, fast jump, flashes from 7.61s
  const xD = interpolate(frame, [sec(6.8), sec(7.9)], [232, 838], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacityD = interpolate(frame, [sec(6.8), sec(7.0)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yD = pathY(Math.min(Math.max(xD, 210), 870)) - 38;
  const flashIn = interpolate(frame, [sec(7.61), sec(7.85)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flashBlink = 0.5 + 0.5 * Math.sin(frame * 0.7);
  const borderAlpha = 0.35 + 0.65 * flashIn * flashBlink + 0.25 * (1 - flashIn) * opacityD;
  const dScale = 1 + flashIn * 0.12 * Math.sin(frame * 0.7);

  const nodeSize = 164;

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "540px 800px",
        }}
      >
        {/* dotted path */}
        <svg
          style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}
          viewBox="0 0 1080 1920"
        >
          <path
            d={d}
            fill="none"
            stroke={theme.muted}
            strokeWidth={7}
            strokeDasharray="10 18"
            strokeLinecap="round"
            opacity={pathOpacity}
          />
        </svg>

        {/* Laptop node left-mid */}
        <div
          style={{
            position: "absolute",
            left: 210 - 110,
            top: 800 - 110,
            width: 220,
            height: 220,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 10,
              top: 10,
              width: 200,
              height: 200,
              borderRadius: 100,
              background: "rgba(255,255,255,0.10)",
              boxShadow: `0 0 ${40 + pulse * 40}px rgba(255,255,255,${haloOpacity})`,
              opacity: haloOpacity,
            }}
          />
          <div
            style={{
              width: nodeSize,
              height: nodeSize,
              borderRadius: nodeSize / 2,
              background: "#10141F",
              border: `8px solid ${theme.accent}`,
              boxShadow: `0 0 32px ${theme.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 72, lineHeight: 1 }}>💻</div>
            <div
              style={{
                color: theme.accent,
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 30,
                marginTop: 4,
                letterSpacing: 2,
              }}
            >
              LAPTOP
            </div>
          </div>
        </div>

        {/* Server node right-mid */}
        <div
          style={{
            position: "absolute",
            left: 870 - 110,
            top: 800 - 110,
            width: 220,
            height: 220,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 10,
              top: 10,
              width: 200,
              height: 200,
              borderRadius: 100,
              background: "rgba(255,255,255,0.10)",
              boxShadow: `0 0 ${40 + pulse * 40}px rgba(255,255,255,${haloOpacity})`,
              opacity: haloOpacity,
            }}
          />
          <div
            style={{
              width: nodeSize,
              height: nodeSize,
              borderRadius: nodeSize / 2,
              background: "#10141F",
              border: `8px solid ${theme.accent2}`,
              boxShadow: `0 0 32px ${theme.accent2}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 72, lineHeight: 1 }}>🖥️</div>
            <div
              style={{
                color: theme.accent2,
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 30,
                marginTop: 4,
                letterSpacing: 2,
              }}
            >
              SERVER
            </div>
          </div>
        </div>

        {/* READY checkmarks */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 560,
            width: 280,
            textAlign: "center",
            opacity: readyOpacity,
            color: theme.good,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 48,
          }}
        >
          ✓ READY
        </div>
        <div
          style={{
            position: "absolute",
            left: 730,
            top: 560,
            width: 280,
            textAlign: "center",
            opacity: readyOpacity,
            color: theme.good,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 48,
          }}
        >
          ✓ READY
        </div>

        {/* Packet A leading white */}
        {opacityA > 0.01 && (
          <div
            style={{
              position: "absolute",
              left: xA - 30,
              top: yA - 19,
              width: 60,
              height: 38,
              borderRadius: 8,
              background: theme.fg,
              boxShadow: "0 0 18px rgba(255,255,255,0.9)",
              opacity: opacityA,
            }}
          />
        )}

        {/* Packet B middle white */}
        {opacityB > 0.01 && (
          <div
            style={{
              position: "absolute",
              left: xB - 30,
              top: yB - 19,
              width: 60,
              height: 38,
              borderRadius: 8,
              background: theme.fg,
              boxShadow: "0 0 18px rgba(255,255,255,0.9)",
              opacity: opacityB,
            }}
          />
        )}

        {/* Packet C white before split */}
        {opacityCwhite > 0.01 && (
          <div
            style={{
              position: "absolute",
              left: xC - 30,
              top: yC - 19,
              width: 60,
              height: 38,
              borderRadius: 8,
              background: theme.fg,
              boxShadow: "0 0 18px rgba(255,255,255,0.9)",
              opacity: opacityCwhite,
            }}
          />
        )}

        {/* Duplicated red-tinted copies */}
        {opacityRed > 0.01 && (
          <>
            <div
              style={{
                position: "absolute",
                left: xC - 30 - 16,
                top: yC1 - 19,
                width: 60,
                height: 38,
                borderRadius: 8,
                background: "#FF8A8A",
                border: "4px solid #FF2020",
                boxShadow: "0 0 22px rgba(255,40,40,0.9)",
                opacity: opacityRed,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: xC - 30 + 16,
                top: yC2 - 19,
                width: 60,
                height: 38,
                borderRadius: 8,
                background: "#FF8A8A",
                border: "4px solid #FF2020",
                boxShadow: "0 0 22px rgba(255,40,40,0.9)",
                opacity: opacityRed,
              }}
            />
          </>
        )}

        {/* Late out-of-order red packet */}
        {opacityD > 0.01 && (
          <div
            style={{
              position: "absolute",
              left: xD - 32,
              top: yD - 21,
              width: 64,
              height: 42,
              borderRadius: 9,
              background: "#FF5A5A",
              border: `6px solid rgba(255,20,20,${borderAlpha})`,
              boxShadow: `0 0 ${20 + flashIn * 30 * flashBlink}px rgba(255,30,30,0.95)`,
              opacity: opacityD,
              transform: `scale(${dScale})`,
            }}
          />
        )}
      </AbsoluteFill>

      {/* end question */}
      <Appear
        at={sec(8.53)}
        dy={30}
        style={{ position: "absolute", top: 1150, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            color: theme.fg,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 98,
            letterSpacing: -2,
          }}
        >
          start safely?
        </div>
      </Appear>
    </AbsoluteFill>
  );
}