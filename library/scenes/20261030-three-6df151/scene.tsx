import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, random } from "remotion";
import { theme, sec, Scene3D } from "@kit";

function JetModel() {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dip = interpolate(frame, [sec(1.06), sec(1.06) + 10], [0, -0.32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift1 = interpolate(frame, [sec(2.86), sec(3.3)], [0, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift2 = interpolate(frame, [sec(3.3), 127], [0, 0.62], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wob1 = interpolate(frame, [sec(1.06), sec(1.06) + 10], [0, -0.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wob2 = interpolate(
    frame,
    [sec(1.06) + 10, sec(1.06) + 22],
    [0, 0.07],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const liftRot = interpolate(frame, [sec(3.3), 127], [0, 0.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = 0.45 + dip + lift1 + lift2;
  const rotZ = wob1 + wob2 + liftRot;

  return (
    <group position={[0, y, 0]} rotation={[0.18, 0.55, rotZ]} scale={[1.15, 1.15, 1.15]}>
      {/* fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.42, 4.2, 10, 1]} />
        <meshStandardMaterial
          color={theme.fg}
          metalness={0.35}
          roughness={0.35}
          flatShading
          transparent
          opacity={fade}
        />
      </mesh>
      {/* nose */}
      <mesh position={[2.35, -0.02, 0]} scale={[1.25, 0.92, 0.92]}>
        <sphereGeometry args={[0.45, 12, 10]} />
        <meshStandardMaterial
          color={theme.fg}
          metalness={0.4}
          roughness={0.3}
          flatShading
          transparent
          opacity={fade}
        />
      </mesh>
      {/* tail cone */}
      <mesh position={[-2.45, 0.12, 0]} rotation={[0, 0, Math.PI / 2 + 0.25]}>
        <coneGeometry args={[0.42, 1.0, 10]} />
        <meshStandardMaterial
          color={theme.muted}
          metalness={0.6}
          roughness={0.45}
          flatShading
          transparent
          opacity={fade}
        />
      </mesh>
      {/* cockpit */}
      <mesh position={[2.05, 0.22, 0]} rotation={[0, 0, -0.15]} scale={[1, 0.5, 1]}>
        <boxGeometry args={[0.55, 0.18, 0.5]} />
        <meshStandardMaterial color={"#0b1220"} roughness={0.2} metalness={0.8} transparent opacity={fade} />
      </mesh>
      {/* right wing */}
      <mesh position={[-0.1, -0.12, 1.35]} rotation={[0, 0.35, 0]}>
        <boxGeometry args={[1.15, 0.07, 1.9]} />
        <meshStandardMaterial
          color={theme.muted}
          metalness={0.65}
          roughness={0.4}
          flatShading
          transparent
          opacity={fade}
        />
      </mesh>
      {/* left wing */}
      <mesh position={[-0.1, -0.12, -1.35]} rotation={[0, -0.35, 0]}>
        <boxGeometry args={[1.15, 0.07, 1.9]} />
        <meshStandardMaterial
          color={theme.muted}
          metalness={0.65}
          roughness={0.4}
          flatShading
          transparent
          opacity={fade}
        />
      </mesh>
      {/* vertical stabilizer */}
      <mesh position={[-1.95, 0.65, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.7, 1.15, 0.08]} />
        <meshStandardMaterial
          color={theme.muted}
          metalness={0.6}
          roughness={0.4}
          flatShading
          transparent
          opacity={fade}
        />
      </mesh>
      {/* horizontal stabilizers */}
      <mesh position={[-1.95, 0.2, 0.65]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.06, 1.05]} />
        <meshStandardMaterial color={theme.fg} metalness={0.4} roughness={0.4} flatShading transparent opacity={fade} />
      </mesh>
      <mesh position={[-1.95, 0.2, -0.65]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.6, 0.06, 1.05]} />
        <meshStandardMaterial color={theme.fg} metalness={0.4} roughness={0.4} flatShading transparent opacity={fade} />
      </mesh>
      {/* engines */}
      <mesh position={[0.35, -0.48, 1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 1.0, 10]} />
        <meshStandardMaterial color={theme.muted} metalness={0.7} roughness={0.35} flatShading transparent opacity={fade} />
      </mesh>
      <mesh position={[0.35, -0.48, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 1.0, 10]} />
        <meshStandardMaterial color={theme.muted} metalness={0.7} roughness={0.35} flatShading transparent opacity={fade} />
      </mesh>
    </group>
  );
}

function LiftArrow() {
  const frame = useCurrentFrame();
  const fadeA = interpolate(frame, [2, 18], [0, 0.95], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dip = interpolate(frame, [sec(1.06), sec(1.06) + 10], [0, -0.32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift1 = interpolate(frame, [sec(2.86), sec(3.3)], [0, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift2 = interpolate(frame, [sec(3.3), 127], [0, 0.62], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tall1 = interpolate(frame, [sec(2.86), sec(3.3)], [0, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tall2 = interpolate(frame, [sec(3.3), 118], [0, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulseOn = frame >= sec(2.24) ? 1 : 0;
  const pulseSin = Math.sin((frame - sec(2.24)) * 0.45);
  const pulseBase = 1.6 + pulseOn * 0.85 * pulseSin;
  const pulseScale = 1 + pulseOn * 0.06 * pulseSin;
  const flashUp = interpolate(frame, [sec(3.3), sec(3.3) + 7], [0, 3.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flashDown = interpolate(frame, [sec(3.3) + 7, 127], [0, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const emissive = pulseBase + flashUp - flashDown;
  const scaleY = (1 + tall1 + tall2) * pulseScale;
  const yBottom = -2.0 + dip * 0.25 + lift1 * 0.4 + lift2 * 0.4;

  return (
    <group position={[0.25, yBottom, 0]} scale={[1.1, scaleY, 1.1]}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 1.2, 12]} />
        <meshStandardMaterial
          color={theme.accent}
          emissive={theme.accent}
          emissiveIntensity={emissive}
          transparent
          opacity={fadeA}
        />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.55, 0.8, 12]} />
        <meshStandardMaterial
          color={theme.accent}
          emissive={theme.accent}
          emissiveIntensity={emissive}
          transparent
          opacity={fadeA}
        />
      </mesh>
      <mesh position={[0, 0.6, 0]} scale={[1.6, 1.02, 1.6]}>
        <cylinderGeometry args={[0.26, 0.26, 1.2, 12, 1, true]} />
        <meshBasicMaterial color={theme.accent} transparent opacity={0.18 * fadeA} />
      </mesh>
      <pointLight color={theme.accent} intensity={2 + emissive} distance={7} position={[0, 1.2, 0.5]} />
    </group>
  );
}

function StarField() {
  const frame = useCurrentFrame();
  const fadeS = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const items: React.ReactNode[] = [];
  for (let i = 0; i < 70; i++) {
    const x = (random(`sx${i}`) * 2 - 1) * 2.3;
    const y0 = (random(`sy${i}`) * 2 - 1) * 4.0;
    const z = -2 - random(`sz${i}`) * 3.2;
    const size = 0.015 + random(`ss${i}`) * 0.032;
    const phase = random(`sp${i}`) * Math.PI * 2;
    const drift = Math.sin(frame * 0.02 + phase) * 0.12;
    const tw = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(frame * 0.18 + phase));
    items.push(
      <mesh key={i} position={[x, y0 + drift, z]}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color={theme.muted} transparent opacity={tw * fadeS} />
      </mesh>
    );
  }
  return <group>{items}</group>;
}

export default function Scene() {
  const frame = useCurrentFrame();
  const driftPush = interpolate(frame, [0, 127], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const push = interpolate(frame, [sec(3.3), 120], [0, 1.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cameraZ = 9 - driftPush - push;
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Scene3D orbit={0.12} cameraZ={cameraZ}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[-6, 2, 4]} color={theme.accent} intensity={2.6} />
        <directionalLight position={[6, 1, 3]} color={theme.accent2} intensity={2.6} />
        <pointLight position={[0, 4, 6]} intensity={0.7} color={"#ffffff"} />
        <StarField />
        <JetModel />
        <LiftArrow />
      </Scene3D>
    </AbsoluteFill>
  );
}