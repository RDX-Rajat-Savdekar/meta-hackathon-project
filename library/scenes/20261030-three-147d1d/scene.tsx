import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, random } from "remotion";
import { theme, sec, Appear, Title, Highlight, Scene3D } from "@kit";

const STREAKS = 130;

function FogAnim() {
  const f = useCurrentFrame();
  const near = interpolate(f, [sec(3.26), sec(4.2)], [3.5, 7.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const far = interpolate(f, [sec(3.26), sec(4.2)], [8, 19], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <fog attach="fog" args={[theme.bg, near, far]} />;
}

function JetModel() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const jetY = interpolate(
    f,
    [0, sec(0.3), sec(1.32), sec(3.26), sec(5.7), sec(8.6)],
    [0.6, 0.28, -0.2, -0.62, -0.15, 0.05],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const pitch = interpolate(
    f,
    [0, sec(0.3), sec(1.32), sec(5.7), sec(7.36)],
    [0, -0.14, -0.21, -0.02, 0.07],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const grow = interpolate(f, [sec(1.0), sec(1.9)], [1, 1.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jetX = interpolate(f, [sec(3.26), sec(5.7), sec(7.36), sec(8.8)], [-0.25, -0.2, 0.12, 0.38], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bob = Math.sin(f * 0.22) * 0.035;
  const shakeAmt = interpolate(f, [sec(7.36), sec(7.7)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shX = shakeAmt * Math.sin(f * 1.7) * 0.05;
  const shY = shakeAmt * Math.sin(f * 2.3 + 1) * 0.05;

  void fps;

  return (
    <group position={[jetX + shX, jetY + bob + shY, 0]} rotation={[0, 0, pitch]} scale={[grow, grow, grow]}>
      {/* fuselage - extruded profile along X */}
      <mesh>
        <cylinderGeometry args={[0.32, 0.32, 3.0, 32]} />
        <meshStandardMaterial color={theme.fg} roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 3.0, 32]} />
        <meshStandardMaterial color={theme.fg} roughness={0.35} metalness={0.15} />
      </mesh>
      {/* nose */}
      <mesh position={[1.55, 0.02, 0]} scale={[1.25, 1, 1]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color={theme.fg} roughness={0.3} metalness={0.15} />
      </mesh>
      {/* tail cone */}
      <mesh position={[-1.65, 0.08, 0]} rotation={[0, 0, -Math.PI / 2 - 0.15]}>
        <cylinderGeometry args={[0.12, 0.32, 0.6, 24]} />
        <meshStandardMaterial color={theme.fg} roughness={0.4} metalness={0.15} />
      </mesh>
      {/* cockpit stripe */}
      <mesh position={[1.25, 0.14, 0.28]}>
        <boxGeometry args={[0.55, 0.1, 0.04]} />
        <meshStandardMaterial color="#111722" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[1.25, 0.14, -0.28]}>
        <boxGeometry args={[0.55, 0.1, 0.04]} />
        <meshStandardMaterial color="#111722" roughness={0.2} metalness={0.6} />
      </mesh>
      {/* vertical tail fin */}
      <mesh position={[-1.45, 0.62, 0]} rotation={[0, 0, 0.28]}>
        <boxGeometry args={[0.45, 0.95, 0.1]} />
        <meshStandardMaterial color={theme.fg} roughness={0.4} />
      </mesh>
      <mesh position={[-1.45, 0.62, 0.06]} rotation={[0, 0, 0.28]}>
        <boxGeometry args={[0.2, 0.5, 0.02]} />
        <meshStandardMaterial color={theme.accent} roughness={0.4} />
      </mesh>
      {/* main wing (side profile below fuselage, thick in Z for depth) */}
      <mesh position={[-0.15, -0.38, 0]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[0.85, 0.09, 1.7]} />
        <meshStandardMaterial color="#e8ecf2" roughness={0.45} />
      </mesh>
      {/* rear stabilizer */}
      <mesh position={[-1.55, 0.18, 0]} rotation={[0, 0, 0.12]}>
        <boxGeometry args={[0.55, 0.07, 1.0]} />
        <meshStandardMaterial color="#e8ecf2" roughness={0.45} />
      </mesh>
      {/* engines */}
      <mesh position={[0.05, -0.52, 0.55]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.55, 20]} />
        <meshStandardMaterial color="#d7dde7" roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0.05, -0.52, -0.55]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.55, 20]} />
        <meshStandardMaterial color="#d7dde7" roughness={0.35} metalness={0.3} />
      </mesh>
      {/* belly thickness */}
      <mesh position={[0, -0.18, 0]} scale={[1, 0.5, 0.9]}>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial color="#c9d1de" roughness={0.5} />
      </mesh>
    </group>
  );
}

function StreakField() {
  const f = useCurrentFrame();
  const travel = interpolate(f, [0, sec(5.7), sec(7.36), sec(8.8)], [0, 7, 28, 50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(f, [sec(5.2), sec(5.7), sec(8.0), sec(8.8)], [0.16, 0.95, 0.95, 0.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stretch = interpolate(f, [sec(5.7), sec(7.36), sec(7.9)], [0.7, 1.25, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const items: React.ReactNode[] = [];
  for (let i = 0; i < STREAKS; i++) {
    const rx = random(`sx${i}`);
    const ry = random(`sy${i}`);
    const rz = random(`sz${i}`);
    const rl = random(`sl${i}`);
    const rs = random(`ss${i}`);
    const x0 = rx * 10 - 5;
    const y0 = -4 + ry * 6.0;
    const z0 = -2.2 + rz * 2.6;
    const speedFactor = 0.55 + rs * 0.95;
    const raw = x0 - travel * speedFactor * 0.28;
    const wrapped = ((((raw + 5) % 10) + 10) % 10) - 5;
    const baseLen = 0.55 + rl * 1.25;
    const len = baseLen * stretch * (0.7 + rz * 0.7);
    const thick = 0.014 + rz * 0.018;
    const op = opacity * (0.45 + rs * 0.55);
    items.push(
      <mesh key={i} position={[wrapped, y0, z0]} scale={[len, 1, 1]}>
        <boxGeometry args={[1, thick, thick]} />
        <meshBasicMaterial color={theme.fg} transparent opacity={op} />
      </mesh>
    );
  }
  return <group>{items}</group>;
}

function FogBlobs() {
  const f = useCurrentFrame();
  const op = interpolate(f, [sec(1.0), sec(3.26), sec(4.1)], [0.32, 0.32, 0.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drift = interpolate(f, [0, sec(8.8)], [0, 3.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blobs: React.ReactNode[] = [];
  for (let i = 0; i < 10; i++) {
    const rx = random(`fx${i}`);
    const ry = random(`fy${i}`);
    const x0 = rx * 8 - 4;
    const y0 = -3.4 + ry * 2.4;
    const raw = x0 + drift * (0.2 + rx * 0.3);
    const wrapped = ((((raw + 4) % 8) + 8) % 8) - 4;
    blobs.push(
      <mesh key={i} position={[wrapped, y0, -1.8 - rx]}>
        <sphereGeometry args={[1.1 + rx * 0.9, 16, 16]} />
        <meshBasicMaterial color={theme.muted} transparent opacity={op * (0.6 + ry * 0.4)} />
      </mesh>
    );
  }
  return <group>{blobs}</group>;
}

function WorldParallax({ children }: { children: React.ReactNode }) {
  const f = useCurrentFrame();
  const px = Math.sin(f * 0.04) * 0.08;
  const py = Math.sin(f * 0.055 + 1) * 0.05;
  const shake = interpolate(f, [sec(7.36), sec(7.7)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sx = shake * Math.sin(f * 1.9) * 0.07;
  const sy = shake * Math.sin(f * 2.6) * 0.07;
  return <group position={[px + sx, py + sy, 0]}>{children}</group>;
}

export default function Scene() {
  const f = useCurrentFrame();
  const emptyGlow = interpolate(f, [sec(3.26), sec(3.8)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const speedGlow = interpolate(f, [sec(5.7), sec(6.1)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Scene3D orbit={0.14} cameraZ={9}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 4, 6]} intensity={2.4} color="#ffd2a0" />
        <directionalLight position={[-4, -2, 4]} intensity={0.7} color={theme.accent} />
        <directionalLight position={[0, -4, 2]} intensity={0.35} color={theme.accent2} />
        <FogAnim />
        <WorldParallax>
          <FogBlobs />
          <StreakField />
          <JetModel />
        </WorldParallax>
      </Scene3D>

      <Title text="363 TONS OF METAL" at={sec(0.3)} y={250} size={88} color={theme.fg} />

      <Appear
        at={sec(0.3)}
        outAt={sec(3.26)}
        style={{ position: "absolute", top: 470, width: "100%", textAlign: "center" }}
      >
        <div style={{ fontFamily: theme.font, fontWeight: 800, fontSize: 56, color: theme.muted }}>
          it <Highlight at={sec(0.3)} color={theme.accent2}>weighs</Highlight> a city block
        </div>
      </Appear>

      <Appear
        at={sec(1.32)}
        outAt={sec(3.26)}
        style={{ position: "absolute", top: 610, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.mono,
            fontWeight: 800,
            fontSize: 64,
            color: theme.accent3,
            letterSpacing: 2,
          }}
        >
          363,000 KG
        </div>
      </Appear>

      <Appear
        at={sec(3.26)}
        outAt={sec(5.7)}
        style={{ position: "absolute", top: 500, width: "100%", textAlign: "center" }}
      >
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 72, color: theme.fg }}>
          NOTHING <Highlight at={sec(3.26)} color={theme.accent}>HOLDING</Highlight> IT
        </div>
      </Appear>

      <Appear
        at={sec(3.26)}
        outAt={sec(5.7)}
        style={{ position: "absolute", top: 1150, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 800,
            fontSize: 48,
            color: theme.muted,
            opacity: 0.4 + emptyGlow * 0.6,
          }}
        >
          empty air below {"->"} only lift
        </div>
      </Appear>

      <Appear
        at={sec(5.7)}
        outAt={sec(7.36)}
        style={{ position: "absolute", top: 500, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 80,
            color: theme.fg,
            opacity: 0.3 + speedGlow * 0.7,
          }}
        >
          RACING THE <Highlight at={sec(5.7)} color={theme.accent}>SKY</Highlight>
        </div>
      </Appear>

      <Appear
        at={sec(7.36)}
        style={{ position: "absolute", top: 500, width: "100%", textAlign: "center" }}
      >
        <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 78, color: theme.fg }}>
          900 KM EVERY <Highlight at={sec(7.36)} color={theme.accent3}>HOUR</Highlight>
        </div>
      </Appear>

      <Appear
        at={sec(7.36)}
        style={{ position: "absolute", top: 1150, width: "100%", alignItems: "center", display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            fontFamily: theme.mono,
            fontWeight: 800,
            fontSize: 52,
            color: theme.bg,
            background: theme.good,
            padding: "14px 36px",
            borderRadius: 999,
          }}
        >
          FULL THRUST
        </div>
      </Appear>
    </AbsoluteFill>
  );
}