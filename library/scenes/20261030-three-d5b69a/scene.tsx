import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, random } from "remotion";
import { theme, sec, Appear, Scene3D } from "@kit";

function JetRig() {
  const frame = useCurrentFrame();

  const curl = interpolate(frame, [sec(3), sec(18)], [0.15, 1.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bright = interpolate(frame, [sec(0.5), sec(3)], [0.12, 0.72], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const extraGlow = interpolate(frame, [sec(8), sec(11)], [0, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const thick = interpolate(frame, [sec(8), sec(14)], [0.85, 1.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const trailLen = interpolate(frame, [sec(0.5), sec(24)], [2.4, 5.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const particleStrength = interpolate(frame, [sec(14), sec(15.2)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const upBase = interpolate(frame, [sec(24), sec(25)], [0, 0.38], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const upPulse = 0.7 + 0.3 * Math.sin(frame * 0.16);
  const upOpacity = upBase * upPulse;

  const bob = Math.sin(frame * 0.055) * 0.05;
  const jetY = 0.8 + bob;
  const glowI = bright + extraGlow;

  const N = 30;
  const wings: { z: number; color: string; emissive: string }[] = [
    { z: 1.15, color: theme.accent, emissive: theme.accent },
    { z: -1.15, color: theme.muted, emissive: "#8a93a8" },
  ];

  const downLen = 0.35 + curl * 1.25;

  const P = 70;

  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 6, 4]} intensity={1.4} color="#ffffff" />
      <pointLight position={[-2, 1.5, 3]} intensity={22} color={theme.accent2} />
      <pointLight position={[0, -1, 2]} intensity={14} color={theme.accent} />
      <pointLight position={[0, -0.6, 0]} intensity={10 + upOpacity * 60} color={theme.accent3} />

      {/* god-ray cone */}
      <mesh position={[0.4, 3.4, -2.2]} rotation={[0.15, 0, 0.25]}>
        <coneGeometry args={[2.6, 7, 24, 1, true]} />
        <meshBasicMaterial color="#9fd8ff" transparent opacity={0.055} depthWrite={false} side={2} />
      </mesh>

      {/* up-glow volume under wings */}
      <mesh position={[0, 0.08, 0]} scale={[2.1, 0.32, 1.9]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={theme.accent3} transparent opacity={upOpacity} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.28, 0]} scale={[1.6, 0.2, 1.4]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#fff6c8" transparent opacity={upOpacity * 0.7} depthWrite={false} />
      </mesh>

      {/* downwash tubes */}
      {wings.map((w, wi) => (
        <mesh key={`tube${wi}`} position={[0.05, jetY - 0.25 - downLen / 2, w.z * 0.92]}>
          <cylinderGeometry args={[0.16 * thick, 0.3 * thick, downLen, 16, 1, true]} />
          <meshStandardMaterial
            color={w.color}
            emissive={w.emissive}
            emissiveIntensity={0.6 + glowI * 2.2}
            transparent
            opacity={0.12 + glowI * 0.5}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* volumetric curling trails */}
      {wings.map((w, wi) =>
        Array.from({ length: N }, (_, i) => {
          const t = i / (N - 1);
          const x = 0.15 - t * trailLen;
          const y = jetY - 0.12 - curl * t * t * 2.3 - t * 0.18;
          const z = w.z * (1 - t * 0.12) + Math.sin(t * 3.2 + frame * 0.03 + wi * 2.1) * 0.06 * t;
          const r = (0.085 + t * 0.24) * thick * (1 + 0.12 * Math.sin(frame * 0.09 + i * 0.7));
          const op = glowI * (1 - t * 0.72) + 0.04;
          return (
            <mesh key={`tr${wi}-${i}`} position={[x, y, z]}>
              <sphereGeometry args={[r, 14, 14]} />
              <meshStandardMaterial
                color={w.color}
                emissive={w.emissive}
                emissiveIntensity={0.5 + glowI * 2.4}
                transparent
                opacity={op}
                depthWrite={false}
              />
            </mesh>
          );
        })
      )}

      {/* bright core */}
      {Array.from({ length: 18 }, (_, i) => {
        const t = i / 17;
        const x = 0.15 - t * trailLen * 0.85;
        const y = jetY - 0.12 - curl * t * t * 2.1 - t * 0.16;
        const z = 1.05 * (1 - t * 0.1);
        const r = 0.05 + t * 0.08;
        return (
          <mesh key={`core${i}`} position={[x, y, z]}>
            <sphereGeometry args={[r, 10, 10]} />
            <meshBasicMaterial color="#e8feff" transparent opacity={glowI * (1 - t) * 0.85} depthWrite={false} />
          </mesh>
        );
      })}

      {/* downward particles */}
      {Array.from({ length: P }, (_, k) => {
        const r1 = random(`px${k}`);
        const r2 = random(`py${k}`);
        const r3 = random(`pz${k}`);
        const r4 = random(`ps${k}`);
        const period = 34 + r4 * 22;
        const age = (((frame - sec(14) + r2 * period) % period) + period) % period / period;
        const side = k % 2 === 0 ? 1 : -1;
        const tipX = 0.05 + (r1 - 0.5) * 0.7;
        const tipZ = side * (0.9 + r3 * 0.45);
        const px = tipX - age * 1.35;
        const py = jetY - 0.25 - age * (2.4 + r4 * 0.9);
        const pz = tipZ + (r3 - 0.5) * 0.3;
        const sz = 0.035 + r4 * 0.06;
        const op = particleStrength * (1 - age) * 0.95;
        if (op <= 0.01) return null;
        return (
          <mesh key={`p${k}`} position={[px, py, pz]}>
            <sphereGeometry args={[sz, 8, 8]} />
            <meshBasicMaterial color={theme.accent} transparent opacity={op} depthWrite={false} />
          </mesh>
        );
      })}

      {/* JET */}
      <group position={[0, jetY, 0]} rotation={[0, 0.28, 0.02]}>
        {/* fuselage */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.3, 3.2, 24]} />
          <meshStandardMaterial color={theme.fg} roughness={0.28} metalness={0.35} />
        </mesh>
        {/* nose */}
        <mesh position={[1.95, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.28, 0.75, 24]} />
          <meshStandardMaterial color={theme.fg} roughness={0.25} metalness={0.35} />
        </mesh>
        {/* tail cone */}
        <mesh position={[-1.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.3, 0.55, 20]} />
          <meshStandardMaterial color="#dfe6f2" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* cockpit */}
        <mesh position={[0.95, 0.22, 0]} scale={[1.4, 0.7, 0.9]}>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color="#0b1e3a" roughness={0.1} metalness={0.8} />
        </mesh>
        {/* main wing */}
        <mesh position={[-0.1, -0.08, 0]}>
          <boxGeometry args={[0.95, 0.08, 2.9]} />
          <meshStandardMaterial color={theme.fg} roughness={0.32} metalness={0.3} />
        </mesh>
        {/* magenta rim strips */}
        <mesh position={[-0.1, -0.02, 1.46]}>
          <boxGeometry args={[0.9, 0.045, 0.07]} />
          <meshStandardMaterial color={theme.accent2} emissive={theme.accent2} emissiveIntensity={2.6} />
        </mesh>
        <mesh position={[-0.1, -0.02, -1.46]}>
          <boxGeometry args={[0.9, 0.045, 0.07]} />
          <meshStandardMaterial color={theme.accent2} emissive={theme.accent2} emissiveIntensity={2.6} />
        </mesh>
        {/* engines */}
        <mesh position={[-0.05, -0.35, 0.72]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.16, 0.7, 18]} />
          <meshStandardMaterial color="#dfe6f2" roughness={0.35} metalness={0.5} />
        </mesh>
        <mesh position={[-0.05, -0.35, -0.72]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.16, 0.7, 18]} />
          <meshStandardMaterial color="#dfe6f2" roughness={0.35} metalness={0.5} />
        </mesh>
        <mesh position={[0.32, -0.35, 0.72]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.14, 0.22, 18]} />
          <meshStandardMaterial color={theme.accent} emissive={theme.accent} emissiveIntensity={1.6} />
        </mesh>
        <mesh position={[0.32, -0.35, -0.72]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.14, 0.22, 18]} />
          <meshStandardMaterial color={theme.accent} emissive={theme.accent} emissiveIntensity={1.6} />
        </mesh>
        {/* tail fin */}
        <mesh position={[-1.45, 0.42, 0]}>
          <boxGeometry args={[0.6, 0.75, 0.08]} />
          <meshStandardMaterial color={theme.fg} roughness={0.35} metalness={0.3} />
        </mesh>
        <mesh position={[-1.45, 0.78, 0]}>
          <boxGeometry args={[0.55, 0.06, 0.1]} />
          <meshStandardMaterial color={theme.accent2} emissive={theme.accent2} emissiveIntensity={2.2} />
        </mesh>
        {/* tailplane */}
        <mesh position={[-1.5, 0.1, 0]}>
          <boxGeometry args={[0.5, 0.06, 1.3]} />
          <meshStandardMaterial color="#dfe6f2" roughness={0.4} metalness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

export default function Scene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cameraZ = interpolate(frame, [sec(0.5), sec(24)], [6.6, 9.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const skyGlow = interpolate(frame, [sec(3), sec(14)], [0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  void fps;

  const stars = Array.from({ length: 70 }, (_, i) => {
    const rx = random(`starx${i}`);
    const ry = random(`stary${i}`);
    const rs = random(`stars${i}`);
    const baseX = rx * 1080;
    const drift = frame * (1 + rs * 2.2);
    const x = (((baseX - drift) % 1080) + 1080) % 1080;
    const y = 200 + ry * 1150;
    const o = 0.25 + rs * 0.6;
    const s = 2 + rs * 4;
    return { x, y, o, s };
  });

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      {/* sky gradient */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, #04070f 0%, #0a1430 52%, #10234f 78%, #06101f 100%)",
        }}
      />
      {/* stars */}
      {stars.map((st, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: st.x,
            top: st.y,
            width: st.s,
            height: st.s,
            borderRadius: st.s,
            background: "#cfe6ff",
            opacity: st.o,
          }}
        />
      ))}
      {/* god-ray wash */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(159,216,255,0.14) 0%, rgba(159,216,255,0.02) 55%, transparent 75%)",
          opacity: 0.5 + skyGlow * 0.5,
        }}
      />
      {/* horizon glow */}
      <div
        style={{
          position: "absolute",
          top: 980,
          left: 40,
          width: 1000,
          height: 220,
          background: "radial-gradient(ellipse at center, rgba(34,211,238,0.20) 0%, transparent 70%)",
          opacity: 0.4 + skyGlow * 0.6,
        }}
      />

      <Scene3D orbit={0.12} cameraZ={cameraZ}>
        <JetRig />
      </Scene3D>

      {/* top labels only */}
      <Appear
        at={sec(3)}
        outAt={sec(8)}
        style={{ position: "absolute", top: 232, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 84,
            color: theme.fg,
            letterSpacing: -2,
          }}
        >
          WINGS SHOVE AIR DOWN
        </div>
      </Appear>

      <Appear
        at={sec(8)}
        outAt={sec(18)}
        style={{ position: "absolute", top: 232, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 96,
            color: theme.accent,
            letterSpacing: -2,
          }}
        >
          DOWNWASH GROWS
        </div>
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 800,
            fontSize: 52,
            color: theme.fg,
            marginTop: 8,
          }}
        >
          tubes thicken under wings
        </div>
      </Appear>

      <Appear
        at={sec(18)}
        outAt={sec(24)}
        style={{ position: "absolute", top: 232, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 92,
            color: theme.fg,
            letterSpacing: -2,
          }}
        >
          THROWING IT DOWN
        </div>
      </Appear>

      <Appear at={sec(24)} style={{ position: "absolute", top: 232, width: "100%", textAlign: "center" }}>
        <div
          style={{
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 88,
            color: theme.accent3,
            letterSpacing: -2,
          }}
        >
          REACTION HOLDS IT UP
        </div>
      </Appear>
    </AbsoluteFill>
  );
}