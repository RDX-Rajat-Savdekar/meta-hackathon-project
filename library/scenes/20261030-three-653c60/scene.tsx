import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme, sec, Appear, Title, Scene3D, useSpringAt } from "@kit";

function DnaRig() {
  const frame = useCurrentFrame();

  const SLOW = 0.035;
  const FAST = 0.15;
  const fSpin = sec(1.02);
  const rot =
    Math.min(frame, fSpin) * SLOW + Math.max(0, frame - fSpin) * FAST;

  const fShrinkStart = sec(1.68);
  const fDrop = sec(1.94);
  const shrink = interpolate(frame, [fShrinkStart, fDrop], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const push = interpolate(frame, [sec(0), fShrinkStart], [1, 1.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const helixScale = Math.max(0.001, push * (1 - shrink * 0.965));
  const helixY = interpolate(frame, [fShrinkStart, fDrop], [0.7, -1.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bright = interpolate(frame, [fSpin, sec(1.68)], [1.2, 3.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rungPulse =
    frame < fSpin ? 1 : 1 + 0.28 * Math.sin(frame * 0.6);

  const dropletIn = interpolate(frame, [fDrop, fDrop + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fPet = sec(2.66);
  const dropletGlowExtra = interpolate(frame, [fPet, fPet + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dropletPulse =
    frame < fPet ? 1 : 1 + 0.22 * Math.sin((frame - fPet) * 0.35);
  const dropletScale = Math.max(0.001, dropletIn * dropletPulse);

  const driveY = interpolate(frame, [fDrop, fDrop + 15], [-5.4, -2.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const driveRot = interpolate(frame, [fDrop, 116], [-0.5, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dropletY = interpolate(frame, [fDrop, fDrop + 15], [-1.55, -1.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const trailOn = interpolate(frame, [fShrinkStart, fShrinkStart + 4], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const trailOff = interpolate(frame, [fDrop, fDrop + 7], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const trailOp = trailOn * trailOff;

  const N = 18;
  const items: number[] = Array.from({ length: N }, (_, i) => i);

  return (
    <group>
      {/* motion-blur trail during shrink */}
      <mesh position={[0, -0.45, -0.8]} scale={[1, 1 + shrink * 0.6, 1]}>
        <cylinderGeometry args={[0.55, 0.18, 3.6, 20, 1, true]} />
        <meshBasicMaterial
          color={theme.accent}
          transparent
          opacity={trailOp}
        />
      </mesh>

      {/* double helix */}
      <group position={[0, helixY, 0]} scale={[helixScale, helixScale, helixScale]}>
        <group rotation={[0, rot, 0]}>
          {items.map((i) => {
            const y = (i - (N - 1) / 2) * 0.32;
            const ang = i * 0.42;
            const ax = Math.cos(ang) * 1.0;
            const az = Math.sin(ang) * 1.0;
            const bx = Math.cos(ang + Math.PI) * 1.0;
            const bz = Math.sin(ang + Math.PI) * 1.0;
            const isMag = i % 2 === 1;
            const rungColor = isMag ? theme.accent2 : "#ffffff";
            return (
              <React.Fragment key={i}>
                <mesh position={[ax, y, az]}>
                  <sphereGeometry args={[0.11, 16, 16]} />
                  <meshStandardMaterial
                    color={theme.accent}
                    emissive={theme.accent}
                    emissiveIntensity={bright}
                    roughness={0.25}
                  />
                </mesh>
                <mesh position={[bx, y, bz]}>
                  <sphereGeometry args={[0.11, 16, 16]} />
                  <meshStandardMaterial
                    color={theme.accent}
                    emissive={theme.accent}
                    emissiveIntensity={bright}
                    roughness={0.25}
                  />
                </mesh>
                <group rotation={[0, -ang, 0]} position={[0, y, 0]}>
                  <mesh scale={[rungPulse, 1, 1]}>
                    <boxGeometry args={[2.0, 0.07, 0.07]} />
                    <meshStandardMaterial
                      color={rungColor}
                      emissive={rungColor}
                      emissiveIntensity={isMag ? bright * 0.9 : 0.7}
                      roughness={0.3}
                    />
                  </mesh>
                </group>
              </React.Fragment>
            );
          })}
        </group>
      </group>

      {/* collapsed droplet */}
      <group position={[0, dropletY, 0]} scale={[dropletScale, dropletScale, dropletScale]}>
        <mesh>
          <sphereGeometry args={[0.24, 24, 24]} />
          <meshStandardMaterial
            color={theme.accent}
            emissive={theme.accent}
            emissiveIntensity={3.2 + dropletGlowExtra * 2.5}
            roughness={0.15}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.42, 20, 20]} />
          <meshBasicMaterial color={theme.accent} transparent opacity={0.22 + dropletGlowExtra * 0.25} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.62, 20, 20]} />
          <meshBasicMaterial color={theme.accent} transparent opacity={0.1 + dropletGlowExtra * 0.12} />
        </mesh>
      </group>

      {/* metallic hard drive */}
      <group position={[0, driveY, 0]} rotation={[0, driveRot, 0]}>
        <mesh>
          <boxGeometry args={[2.0, 0.28, 1.3]} />
          <meshStandardMaterial color="#8e95a1" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[1.7, 0.05, 1.0]} />
          <meshStandardMaterial color="#d2d7df" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[-0.35, 0.2, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.04, 32]} />
          <meshStandardMaterial color="#eef1f5" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.55, 0.19, 0.28]}>
          <boxGeometry args={[0.28, 0.03, 0.12]} />
          <meshStandardMaterial color={theme.good} emissive={theme.good} emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[0.55, 0.1, -0.35]}>
          <boxGeometry args={[0.4, 0.14, 0.02]} />
          <meshStandardMaterial color="#1a1e24" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

export default function Scene() {
  const frame = useCurrentFrame();
  const petSpring = useSpringAt(sec(2.66), 14);

  const gramOut = interpolate(frame, [sec(1.34), sec(1.68)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bgBoost = interpolate(frame, [sec(1.02), sec(1.68)], [0.35, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bgPulse = 0.9 + 0.1 * Math.sin(frame * 0.18);

  const petOpacity = interpolate(frame, [sec(2.66), sec(2.66) + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const petScale = 0.4 + 0.6 * petSpring + 0.03 * Math.sin(frame * 0.15);
  const petGlow = interpolate(frame, [sec(2.66), sec(2.66) + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      {/* ambient cyan glow */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 520,
          width: 900,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${theme.accent}55, transparent)`,
          opacity: bgBoost * bgPulse + petGlow * 0.5,
        }}
      />

      <Scene3D orbit={0} cameraZ={9}>
        <DnaRig />
      </Scene3D>

      {/* 1 GRAM slam */}
      <div style={{ opacity: gramOut }}>
        <Title text="1 GRAM" at={sec(0)} size={104} y={310} color={theme.fg} />
      </div>

      <Appear
        at={sec(1.02)}
        outAt={sec(1.68)}
        dy={20}
        style={{ position: "absolute", top: 500, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            display: "inline-block",
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 48,
            letterSpacing: 4,
            color: theme.accent2,
            background: "rgba(0,0,0,0.55)",
            border: `2px solid ${theme.accent2}`,
            borderRadius: 999,
            padding: "10px 36px",
          }}
        >
          DNA SPIN-UP
        </div>
      </Appear>

      {/* collapsing hint */}
      <Appear
        at={sec(1.68)}
        outAt={sec(1.94)}
        dy={30}
        style={{ position: "absolute", top: 520, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 54,
            color: theme.accent,
            letterSpacing: 3,
          }}
        >
          SHRINKING ↓
        </div>
      </Appear>

      {/* drive label */}
      <Appear
        at={sec(1.94)}
        outAt={sec(2.66)}
        dy={20}
        style={{ position: "absolute", top: 1240, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.mono,
            fontWeight: 800,
            fontSize: 48,
            color: theme.muted,
          }}
        >
          ▼ 1 GRAM DROPLET
        </div>
      </Appear>

      {/* 200 PETABYTES finale behind droplet */}
      <div
        style={{
          position: "absolute",
          top: 430,
          width: "100%",
          textAlign: "center",
          opacity: petOpacity,
          transform: `scale(${petScale})`,
        }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 110,
            lineHeight: 1,
            color: theme.fg,
            textShadow: `0 0 ${30 + petGlow * 50}px ${theme.accent}`,
          }}
        >
          200
        </div>
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 88,
            lineHeight: 1.05,
            color: theme.fg,
            letterSpacing: 2,
            textShadow: `0 0 ${20 + petGlow * 40}px ${theme.accent}`,
            marginTop: 6,
          }}
        >
          PETABYTES
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: theme.font,
            fontWeight: 800,
            fontSize: 50,
            color: theme.accent,
          }}
        >
          IN YOUR PALM
        </div>
      </div>
    </AbsoluteFill>
  );
}