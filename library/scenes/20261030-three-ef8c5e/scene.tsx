import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, random } from "remotion";
import { theme, sec, Scene3D } from "@kit";

function JetModel() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fade = interpolate(frame, [sec(0), sec(0.6)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleIn = interpolate(frame, [sec(0), sec(0.8)], [0.82, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beat 1.06: wobble down then hold (not floating)
  const dip = interpolate(frame, [sec(1.06), sec(1.5)], [0, -0.38], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Beat 2.86: pushed up a touch
  const lift1 = interpolate(frame, [sec(2.86), sec(3.3)], [0, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Beat 3.3: visible lift
  const lift2 = interpolate(frame, [sec(3.3), sec(4.3)], [0, 0.62], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const jetY = 0.45 + dip + lift1 + lift2;

  const bank = interpolate(frame, [sec(1.06), sec(1.5)], [0, -0.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const breathe = Math.sin(frame * 0.08) * 0.03;

  return (
    <group position={[0, jetY, 0]} scale={[scaleIn, scaleIn, scaleIn]} rotation={[0.08, -0.55, bank + breathe * 0.3]}>
      {/* fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.55, 0.55, 4.6, 12]} />
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
      <mesh position={[2.65, 0, 0]} scale={[1.5, 1, 1]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial
          color={theme.fg}
          metalness={0.35}
          roughness={0.3}
          flatShading
          transparent
          opacity={fade}
        />
      </mesh>
      {/* tail cone */}
      <mesh position={[-2.7, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.55, 1.1, 12]} />
        <meshStandardMaterial
          color={theme.muted}
          metalness={0.8}
          roughness={0.4}
          flatShading
          transparent
          opacity={fade}
        />
      </mesh>
      {/* main wings */}
      <mesh position={[0.2, -0.28, 0]} rotation={[0, 0.12, 0]}>
        <boxGeometry args={[1.45, 0.1, 6.4]} />
        <meshStandardMaterial
          color={theme.muted}
          metalness={0.75}
          roughness={0.4}
          flatShading
          transparent
          opacity={fade}
        />
      </mesh>
      {/* winglets */}
      <mesh position={[0.05, 0.05, 3.15]}>
        <boxGeometry args={[0.5, 0.65, 0.09]} />
        <meshStandardMaterial color={theme.fg} metalness={0.4} roughness={0.4} flatShading transparent opacity={fade} />
      </mesh>
      <mesh position={[0.05, 0.05, -3.15]}>
        <boxGeometry args={[0.5, 0.65, 0.09]} />
        <meshStandardMaterial color={theme.fg} metalness={0.4} roughness={0.4} flatShading transparent opacity={fade} />
      </mesh>
      {/* engines */}
      <mesh position={[0.65, -0.62, 1.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 1.25, 12]} />
        <meshStandardMaterial color={theme.muted} metalness={0.85} roughness={0.35} flatShading transparent opacity={fade} />
      </mesh>
      <mesh position={[0.65, -0.62, -1.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 1.25, 12]} />
        <meshStandardMaterial color={theme.muted} metalness={0.85} roughness={0.35} flatShading transparent opacity={fade} />
      </mesh>
      {/* vertical tail */}
      <mesh position={[-2.15, 0.85, 0]}>
        <boxGeometry args={[0.95, 1.5, 0.12]} />
        <meshStandardMaterial color={theme.fg} metalness={0.4} roughness={0.4} flatShading transparent opacity={fade} />
      </mesh>
      {/* horizontal stabilizers */}
      <mesh position={[-2.15, 0.25, 0]}>
        <boxGeometry args={[0.85, 0.08, 2.7]} />
        <meshStandardMaterial color={theme.muted} metalness={0.75} roughness={0.4} flatShading transparent opacity={fade} />
      </mesh>
      {/* cockpit */}
      <mesh position={[2.15, 0.32, 0]}>
        <boxGeometry args={[0.6, 0.22, 0.5]} />
        <meshStandardMaterial color="#0b1220" metalness={0.2} roughness={0.2} transparent opacity={fade} />
      </mesh>
    </group>
  );
}

function LiftArrow() {
  const frame = useCurrentFrame();

  const fade = interpolate(frame, [sec(0), sec(0.7)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleIn = interpolate(frame, [sec(0), sec(0.7)], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beat 2.86: scales taller into belly
  const pushGrow = interpolate(frame, [sec(2.86), sec(3.3)], [1, 1.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pushGrow2 = interpolate(frame, [sec(3.3), sec(4.2)], [0, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const totalGrow = pushGrow + pushGrow2;

  // Beat 2.24: rhythmic pulsing
  const pulseOn = interpolate(frame, [sec(2.24), sec(2.7)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = Math.sin((frame - sec(2.24)) * 0.35) * 0.9 * pulseOn;

  // Beat 3.3: flash bright
  const flash = interpolate(frame, [sec(3.3), sec(3.55)], [0, 4.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flashDecay = interpolate(frame, [sec(3.55), sec(4.4)], [0, -2.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const jetDip = interpolate(frame, [sec(1.06), sec(1.5)], [0, -0.38], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jetLift1 = interpolate(frame, [sec(2.86), sec(3.3)], [0, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jetLift2 = interpolate(frame, [sec(3.3), sec(4.3)], [0, 0.62], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const followY = jetDip + jetLift1 + jetLift2;

  const emissiveIntensity = 1.7 + pulse + flash + flashDecay;
  const arrowY = -2.15 + followY * 0.85;

  return (
    <group position={[0, arrowY, 0.2]} scale={[scaleIn, scaleIn * totalGrow, scaleIn]}>
      {/* shaft */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 1.9, 16]} />
        <meshStandardMaterial
          color={theme.accent}
          emissive={theme.accent}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={0.95 * fade}
        />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.05, 0]}>
        <coneGeometry args={[0.78, 1.15, 16]} />
        <meshStandardMaterial
          color={theme.accent}
          emissive={theme.accent}
          emissiveIntensity={emissiveIntensity + 0.6}
          transparent
          opacity={fade}
        />
      </mesh>
      {/* halo */}
      <mesh position={[0, -0.15, 0]} scale={[1.9, 1.05, 1.9]}>
        <cylinderGeometry args={[0.32, 0.32, 2.6, 16, 1, true]} />
        <meshStandardMaterial
          color={theme.accent}
          emissive={theme.accent}
          emissiveIntensity={0.7 + pulseOn * 0.5}
          transparent
          opacity={0.22 * fade}
          side={2 as any}
        />
      </mesh>
      <pointLight color={theme.accent} intensity={18 + pulseOn * 14 + flash * 8} distance={9} position={[0, 0.5, 1.2]} />
    </group>
  );
}

function Dust() {
  const frame = useCurrentFrame();
  const count = 110;
  const items: { x: number; y: number; z: number; s: number; ph: number }[] = [];
  for (let i = 0; i < count; i++) {
    const x = random(`dust-x-${i}`) * 5.4 - 2.7;
    const y = random(`dust-y-${i}`) * 9 - 4.5;
    const z = random(`dust-z-${i}`) * -3.5 - 0.5;
    const s = 0.02 + random(`dust-s-${i}`) * 0.05;
    const ph = random(`dust-p-${i}`) * Math.PI * 2;
    items.push({ x, y, z, s, ph });
  }
  const rot = (frame * 0.008) % (Math.PI * 2);
  return (
    <group rotation={[0, rot * 0.25, 0]}>
      {items.map((d, i) => {
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(frame * 0.12 + d.ph));
        const driftY = d.y + Math.sin(frame * 0.02 + d.ph) * 0.25 + frame * 0.003;
        const wrappedY = ((driftY + 4.5) % 9 + 9) % 9 - 4.5;
        return (
          <mesh key={i} position={[d.x, wrappedY, d.z]}>
            <sphereGeometry args={[d.s, 6, 6]} />
            <meshStandardMaterial color={theme.muted} emissive={theme.muted} emissiveIntensity={0.4} transparent opacity={tw} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Scene() {
  const frame = useCurrentFrame();
  const basePush = interpolate(frame, [sec(0), sec(3.3)], [0, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fastPush = interpolate(frame, [sec(3.3), sec(4.5)], [0, 1.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cameraZ = 10.6 - basePush - fastPush;

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Scene3D orbit={0.22} cameraZ={cameraZ}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[0, 4, 6]} intensity={1.6} color={theme.fg} />
        <pointLight position={[-6, 2, 3]} intensity={90} color={theme.accent} />
        <pointLight position={[6, 1.5, 3]} intensity={90} color={theme.accent2} />
        <pointLight position={[0, -4, 4]} intensity={20} color="#ffffff" />
        <Dust />
        <JetModel />
        <LiftArrow />
      </Scene3D>
    </AbsoluteFill>
  );
}