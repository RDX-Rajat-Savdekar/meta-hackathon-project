import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { theme, sec, Appear, Scene3D } from "@kit";

function FlightRig({ frame }: { frame: number }) {
  const jetY =
    interpolate(
      frame,
      [0, sec(0.3), sec(1.32), sec(3.26), sec(5.7), sec(7.36), 254],
      [0.6, 0.35, -0.45, -1.05, -0.75, -0.65, -0.55],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    ) + Math.sin(frame * 0.08) * 0.05;

  const jetX = interpolate(
    frame,
    [0, sec(3.26), sec(5.7), sec(7.36), 254],
    [-0.4, -0.5, -0.2, 0.5, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const pitch = interpolate(
    frame,
    [0, sec(0.3), sec(1.32), sec(3.26), sec(5.7), sec(7.36)],
    [0.02, -0.08, -0.2, -0.14, -0.02, 0.06],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const jetScale = interpolate(
    frame,
    [0, sec(1.32), sec(3.26), sec(5.7)],
    [0.95, 1.22, 1.32, 1.32],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const shakeAmp = interpolate(
    frame,
    [sec(7.36), sec(7.36) + 12],
    [0, 0.07],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const shakeX = Math.sin(frame * 1.9) * shakeAmp;
  const shakeY = Math.sin(frame * 2.7 + 1.3) * shakeAmp;

  const travelE = interpolate(
    frame,
    [0, 171, 221, 254],
    [0, 42.75, 92.75, 158],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const lenScale = interpolate(
    frame,
    [0, 171, 221, 254],
    [0.6, 0.7, 1.2, 2.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const lineOpacity = interpolate(
    frame,
    [0, sec(3.26), 156, sec(5.7)],
    [0.14, 0.12, 0.2, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const streaks: { x: number; y: number; z: number; len: number; th: number }[] = [];
  for (let i = 0; i < 130; i++) {
    const y0 = (random(`sy${i}`) - 0.5) * 8.4;
    const z0 = (random(`sz${i}`) - 0.5) * 3.2 - 0.4;
    const x0 = random(`sx${i}`) * 14 - 7;
    const spd = 0.6 + random(`ss${i}`) * 0.9;
    const baseLen = 0.6 + random(`sl${i}`) * 1.6;
    const th = random(`st${i}`) > 0.82 ? 0.035 : 0.018;
    const travel = spd * travelE * 0.16;
    const xRaw = x0 - travel;
    let m = (xRaw + 7) % 14;
    if (m < 0) {
      m += 14;
    }
    const x = -7 + m;
    const len = baseLen * lenScale * (0.7 + spd * 0.45);
    streaks.push({ x, y: y0, z: z0, len, th });
  }

  return (
    <group position={[shakeX, shakeY, 0]}>
      <group position={[jetX, jetY, 0]} rotation={[0, 0, pitch]} scale={[jetScale, jetScale, jetScale]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 3.6, 24]} />
          <meshStandardMaterial color={theme.fg} roughness={0.32} metalness={0.25} />
        </mesh>
        <mesh position={[1.9, -0.02, 0]} scale={[1.35, 1, 1]}>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial color={theme.fg} roughness={0.32} metalness={0.25} />
        </mesh>
        <mesh position={[-2.05, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.12, 0.7, 24]} />
          <meshStandardMaterial color={theme.fg} roughness={0.35} metalness={0.25} />
        </mesh>
        <mesh position={[1.45, 0.24, 0]} rotation={[0, 0, -0.25]}>
          <boxGeometry args={[0.5, 0.12, 0.42]} />
          <meshStandardMaterial color="#0b1220" roughness={0.15} metalness={0.7} />
        </mesh>
        <mesh position={[0.4, 0.12, 0.375]}>
          <boxGeometry args={[2.3, 0.07, 0.02]} />
          <meshStandardMaterial color="#0b1220" roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh position={[0.4, 0.12, -0.375]}>
          <boxGeometry args={[2.3, 0.07, 0.02]} />
          <meshStandardMaterial color="#0b1220" roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh position={[-1.65, 0.7, 0]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.5, 1.1, 0.12]} />
          <meshStandardMaterial color={theme.accent2} roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0.15, -0.32, 0]}>
          <boxGeometry args={[0.85, 0.1, 2.6]} />
          <meshStandardMaterial color="#e8edf3" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[-1.95, 0.2, 0]}>
          <boxGeometry args={[0.55, 0.08, 1.4]} />
          <meshStandardMaterial color="#dfe6ef" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0.3, -0.55, 0.95]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.75, 20]} />
          <meshStandardMaterial color={theme.fg} roughness={0.35} metalness={0.3} />
        </mesh>
        <mesh position={[0.3, -0.55, -0.95]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.75, 20]} />
          <meshStandardMaterial color={theme.fg} roughness={0.35} metalness={0.3} />
        </mesh>
        <mesh position={[0.7, -0.55, 0.95]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.14, 0.06, 20]} />
          <meshStandardMaterial color="#0b1220" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0.7, -0.55, -0.95]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.14, 0.06, 20]} />
          <meshStandardMaterial color="#0b1220" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0.15, -0.32, 1.32]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={theme.good} />
        </mesh>
        <mesh position={[0.15, -0.32, -1.32]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#ff4d4d" />
        </mesh>
      </group>
      {streaks.map((s, idx) => (
        <mesh key={idx} position={[s.x, s.y, s.z]}>
          <boxGeometry args={[s.len, s.th, s.th]} />
          <meshBasicMaterial color={theme.fg} transparent opacity={lineOpacity} />
        </mesh>
      ))}
    </group>
  );
}

export default function Scene() {
  const frame = useCurrentFrame();
  const fogNear = interpolate(frame, [88, 128], [4, 9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fogFar = interpolate(frame, [88, 128], [11, 22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fogOverlay = interpolate(frame, [0, sec(3.26), 130], [0.22, 0.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const speedW = interpolate(frame, [sec(5.7), sec(7.36), 254], [120, 560, 880], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Scene3D orbit={0.12} cameraZ={9}>
        <fog attach="fog" args={[theme.bg, fogNear, fogFar]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 4, 6]} color="#ffcf9e" intensity={2.2} />
        <directionalLight position={[-4, -2, 3]} color="#5ac8fa" intensity={0.5} />
        <FlightRig frame={frame} />
      </Scene3D>

      <AbsoluteFill
        style={{ background: theme.muted, opacity: fogOverlay, pointerEvents: "none" }}
      />

      <Appear
        at={0}
        outAt={sec(3.26)}
        style={{
          position: "absolute",
          top: 210,
          width: "100%",
          textAlign: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 800,
            fontSize: 78,
            color: theme.fg,
            letterSpacing: 2,
          }}
        >
          A JET WEIGHS
        </div>
      </Appear>
      <Appear
        at={sec(1.32)}
        outAt={sec(3.26)}
        style={{ position: "absolute", top: 305, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 110,
            color: theme.accent3,
          }}
        >
          400 TONS
        </div>
      </Appear>
      <Appear
        at={sec(0.3)}
        outAt={sec(3.26)}
        style={{ position: "absolute", top: 460, width: "100%", textAlign: "center" }}
      >
        <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: 48, color: theme.accent2 }}>
          ▼ SINKING ▼
        </div>
      </Appear>

      <Appear
        at={sec(3.26)}
        outAt={sec(5.7)}
        style={{ position: "absolute", top: 230, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 82,
            color: theme.fg,
            lineHeight: 1.05,
          }}
        >
          NOTHING HOLDING
          <br />
          IT UP
        </div>
      </Appear>
      <Appear
        at={sec(3.26)}
        outAt={sec(5.7)}
        style={{ position: "absolute", top: 500, width: "100%", textAlign: "center" }}
      >
        <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: 48, color: theme.muted }}>
          ▼ EMPTY AIR ▼
        </div>
      </Appear>

      <Appear
        at={sec(5.7)}
        style={{ position: "absolute", top: 230, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 76,
            color: theme.fg,
            lineHeight: 1.05,
          }}
        >
          STAY IN THE SKY?
        </div>
      </Appear>
      <Appear
        at={sec(5.7)}
        style={{
          position: "absolute",
          top: 430,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 920,
            height: 14,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 7,
            overflow: "hidden",
          }}
        >
          <div style={{ width: speedW, height: "100%", background: theme.accent }} />
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: theme.font,
            fontWeight: 800,
            fontSize: 44,
            color: theme.muted,
          }}
        >
          AIRSPEED RISING
        </div>
      </Appear>
      <Appear
        at={sec(6.68)}
        style={{ position: "absolute", top: 600, width: "100%", display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            background: theme.accent,
            color: "#00131a",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 64,
            padding: "8px 36px",
            borderRadius: 24,
          }}
        >
          500 MPH
        </div>
      </Appear>
    </AbsoluteFill>
  );
}