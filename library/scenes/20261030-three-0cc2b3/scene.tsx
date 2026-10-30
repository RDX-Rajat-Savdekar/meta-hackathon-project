import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, random } from "remotion";
import { theme, sec, ramp, Appear, Scene3D } from "@kit";
import { Line } from "@react-three/drei";

// precomputed helix backbones (two turns)
const PTS_A: [number, number, number][] = [];
const PTS_B: [number, number, number][] = [];
for (let k = 0; k <= 22; k++) {
  const t = (k / 22) * Math.PI * 4;
  const y = (k / 22 - 0.5) * 1.3;
  PTS_A.push([Math.cos(t) * 0.34, y, Math.sin(t) * 0.34]);
  PTS_B.push([Math.cos(t + Math.PI) * 0.34, y, Math.sin(t + Math.PI) * 0.34]);
}

function HelixField() {
  const frame = useCurrentFrame();
  const mainScale = interpolate(frame, [sec(0), sec(1.78), sec(2.6)], [1.55, 1.55, 0.001], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mainRot = frame * 0.075;
  const mainGlow = interpolate(frame, [sec(0), sec(0.9)], [1.2, 2.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const COUNT = 92;
  const minis: React.ReactNode[] = [];
  for (let i = 0; i < COUNT; i++) {
    const r1 = random(`mini-a-${i}`);
    const r2 = random(`mini-b-${i}`);
    const r3 = random(`mini-c-${i}`);
    const baseAng = r1 * Math.PI * 2 + i * 0.7;
    const rad0 = 0.55 + r2 * 1.75;
    const y0 = 2.4 - r3 * 3.1;
    const spinSpeed = 0.028 + r1 * 0.035;
    const spin = baseAng + frame * spinSpeed;
    const x0 = Math.cos(spin) * rad0;
    const z0 = Math.sin(spin) * rad0 * 0.65 - 0.4;
    const bob = Math.sin(frame * 0.09 + i * 1.7) * 0.16;
    const yCloud = y0 + bob;

    const fStart = sec(1.78) + (i % 26) * 1.6;
    const fEnd = sec(3.1) + (i % 26) * 1.6;
    const fp = interpolate(frame, [fStart, fEnd], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const birth = ramp(frame, sec(0.9) + (i % 42) * 0.55, 12);
    const shrink = interpolate(fp, [0.72, 1], [1, 0.001], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const s0 = 0.16 + r2 * 0.24;
    const sc = Math.max(0.001, s0 * birth * shrink);
    if (sc < 0.005) continue;
    const x = x0 * (1 - fp);
    const y = yCloud * (1 - fp) + -0.55 * fp;
    const z = z0 * (1 - fp);
    const col = i % 3 === 1 ? theme.accent2 : theme.accent;
    const rotY = frame * 0.14 + i * 1.3 + r1 * 4;

    minis.push(
      <group key={i} position={[x, y, z]} scale={sc} rotation={[0.2 * Math.sin(i + frame * 0.05), rotY, 0.15]}>
        {/* @ts-ignore drei Line types */}
        <Line points={PTS_A} color={col} lineWidth={3} transparent opacity={0.95} />
        {/* @ts-ignore drei Line types */}
        <Line points={PTS_B} color={col} lineWidth={3} transparent opacity={0.95} />
      </group>
    );
  }

  return (
    <group>
      {mainScale > 0.01 && (
        <group position={[0, 0.9, 0]} scale={mainScale} rotation={[0.12, mainRot, 0]}>
          {/* @ts-ignore */}
          <Line points={PTS_A} color={theme.accent} lineWidth={7} transparent opacity={1} />
          {/* @ts-ignore */}
          <Line points={PTS_B} color={theme.accent} lineWidth={7} transparent opacity={1} />
          {Array.from({ length: 7 }).map((_, k) => {
            const t = (k / 6) * Math.PI * 4;
            const y = (k / 6 - 0.5) * 1.3;
            const xa = Math.cos(t) * 0.34;
            const za = Math.sin(t) * 0.34;
            const xb = Math.cos(t + Math.PI) * 0.34;
            const zb = Math.sin(t + Math.PI) * 0.34;
            const mx = (xa + xb) / 2;
            const mz = (za + zb) / 2;
            const len = Math.sqrt((xb - xa) * (xb - xa) + (zb - za) * (zb - za));
            const ang = Math.atan2(zb - za, xb - xa);
            return (
              <group key={k} position={[mx, y, mz]} rotation={[0, -ang, 0]}>
                <mesh>
                  <boxGeometry args={[Math.max(0.05, len), 0.035, 0.035]} />
                  <meshStandardMaterial color="#e8fbff" emissive="#ffffff" emissiveIntensity={0.7} />
                </mesh>
              </group>
            );
          })}
          {PTS_A.filter((_, idx) => idx % 2 === 0).map((p, k) => (
            <mesh key={`a${k}`} position={p}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshStandardMaterial color={theme.accent} emissive={theme.accent} emissiveIntensity={mainGlow} />
            </mesh>
          ))}
          {PTS_B.filter((_, idx) => idx % 2 === 0).map((p, k) => (
            <mesh key={`b${k}`} position={p}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshStandardMaterial color={theme.accent2} emissive={theme.accent2} emissiveIntensity={mainGlow} />
            </mesh>
          ))}
          <pointLight color={theme.accent} intensity={2.2} distance={9} position={[0, 0, 1.6]} />
        </group>
      )}
      {minis}
    </group>
  );
}

function VialMesh() {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [sec(1.78), sec(2.9)], [0.15, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const freeze = interpolate(frame, [sec(3.28), sec(4.3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = interpolate(frame, [sec(4.98), sec(7.29)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulseScale = 1 + pulse * Math.sin(frame * 0.28) * 0.075 + freeze * Math.sin(frame * 0.12) * 0.02;
  const glowI = 0.7 + interpolate(frame, [sec(1.78), sec(4.3)], [0, 2.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) + pulse * (1.1 + Math.sin(frame * 0.28) * 0.6);
  const s = Math.max(0.001, appear * pulseScale);

  return (
    <group position={[0, -1.55, 0]} scale={s}>
      <pointLight color={theme.good} intensity={2.5 + glowI} distance={10} position={[0, 0.4, 1.4]} />
      <pointLight color={theme.accent} intensity={1.2} distance={8} position={[0, 1.6, 1]} />
      {/* liquid */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.46, 0.4, 1.05, 32]} />
        <meshStandardMaterial color={theme.good} emissive={theme.good} emissiveIntensity={glowI} roughness={0.25} />
      </mesh>
      {/* glass */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.66, 0.56, 1.75, 32, 1, true]} />
        <meshStandardMaterial color="#cdeeff" transparent opacity={0.24 + freeze * 0.12} roughness={0.08} metalness={0.15} side={2 as any} />
      </mesh>
      <mesh position={[0, -0.875, 0]}>
        <sphereGeometry args={[0.56, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#cdeeff" transparent opacity={0.24} roughness={0.08} />
      </mesh>
      {/* ice shell */}
      <mesh position={[0, 0.05, 0]} scale={1.08}>
        <cylinderGeometry args={[0.68, 0.6, 1.85, 32, 1, true]} />
        <meshStandardMaterial color="#9fd4ff" transparent opacity={freeze * 0.4} roughness={0.15} emissive="#7fbfff" emissiveIntensity={freeze * 0.9} side={2 as any} />
      </mesh>
      {/* cap */}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.32, 32]} />
        <meshStandardMaterial color="#eef7ff" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.28, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.22, 24]} />
        <meshStandardMaterial color="#9fb3c8" roughness={0.4} />
      </mesh>
      {/* shine bar */}
      <mesh position={[-0.32, 0.25, 0.58]} rotation={[0, 0, 0.35]}>
        <planeGeometry args={[0.12, 1.1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.25 + freeze * 0.55} />
      </mesh>
    </group>
  );
}

export default function Scene() {
  const frame = useCurrentFrame();
  const years = Math.floor(
    interpolate(frame, [sec(1.78), sec(4.4)], [0, 10000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  const yearStr = years.toLocaleString("en-US");
  const yearProg = interpolate(frame, [sec(1.78), sec(4.4)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const iceOp = interpolate(frame, [sec(3.28), sec(4.4)], [0, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const plugOp = interpolate(frame, [sec(3.28), sec(3.6), sec(4.1), sec(4.55)], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const plugScale = interpolate(frame, [sec(3.28), sec(3.7)], [1.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ultIn = interpolate(frame, [sec(4.98), sec(5.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ultScale = interpolate(frame, [sec(4.98), sec(5.7)], [0.55, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) + Math.sin(frame * 0.18) * 0.02 * ultIn;
  const ultOp = ramp(frame, sec(4.98), 10);
  const sweepP = ((frame - sec(3.28)) % 60) / 60;
  const sweepLeft = -30 + sweepP * 160;
  const cloudGlow = interpolate(frame, [sec(0.9), sec(2.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      <Scene3D orbit={0.32} cameraZ={9}>
        <HelixField />
        <VialMesh />
      </Scene3D>

      {/* soft center glow that builds with duplication */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 420,
          height: 640,
          background: "radial-gradient(ellipse at center, rgba(0,229,255,0.22) 0%, rgba(255,45,248,0.10) 45%, transparent 72%)",
          opacity: 0.35 + cloudGlow * 0.65,
        }}
      />

      {/* year counter */}
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center" }}>
        <Appear at={sec(1.78)}>
          <div style={{ fontFamily: theme.mono, fontWeight: 800, fontSize: 44, letterSpacing: 6, color: theme.accent }}>
            DNA SURVIVES
          </div>
        </Appear>
        <Appear at={sec(1.78)}>
          <div
            style={{
              marginTop: 8,
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 104,
              color: theme.fg,
              textShadow: "0 0 28px rgba(0,229,255,0.9), 0 4px 0 rgba(0,0,0,0.6)",
              lineHeight: 1,
            }}
          >
            {yearStr}
          </div>
        </Appear>
        <Appear at={sec(1.78)}>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12, gap: 12, alignItems: "center" }}>
            <div style={{ fontFamily: theme.font, fontWeight: 900, fontSize: 52, color: theme.fg }}>YEARS</div>
            <div style={{ width: 420, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
              <div style={{ width: `${yearProg * 100}%`, height: "100%", background: theme.accent }} />
            </div>
          </div>
        </Appear>
      </div>

      {/* power plug + red X */}
      {plugOp > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: 760,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            opacity: plugOp,
            transform: `scale(${plugScale})`,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 300,
              height: 200,
              borderRadius: 28,
              background: "rgba(20,28,38,0.82)",
              border: "3px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 110, filter: "grayscale(1)", opacity: 0.9 }}>🔌</div>
            <div style={{ position: "absolute", fontSize: 150, fontWeight: 900, color: "#ff3b3b", lineHeight: 1, textShadow: "0 0 18px rgba(255,0,0,0.9)" }}>
              ×
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -52,
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 48,
                color: "#ff6b6b",
                letterSpacing: 2,
              }}
            >
              NO POWER
            </div>
          </div>
        </div>
      )}

      {/* frozen ice overlay */}
      {iceOp > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 192,
            height: 1250,
            opacity: iceOp,
            background: "linear-gradient(180deg, rgba(159,212,255,0.30) 0%, rgba(159,212,255,0.08) 55%, rgba(0,229,255,0.14) 100%)",
            borderTop: "3px solid rgba(200,235,255,0.7)",
            borderBottom: "3px solid rgba(200,235,255,0.5)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${sweepLeft}%`,
              width: 140,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              transform: "skewX(-18deg)",
            }}
          />
          <div style={{ position: "absolute", top: 18, width: "100%", textAlign: "center", fontFamily: theme.mono, fontSize: 40, fontWeight: 800, letterSpacing: 8, color: "#dff3ff" }}>
            ❄ FROZEN • STABLE ❄
          </div>
        </div>
      )}

      {/* ULTIMATE BACKUP DRIVE */}
      {ultOp > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: 1010,
            width: "100%",
            textAlign: "center",
            opacity: ultOp,
            transform: `scale(${ultScale})`,
          }}
        >
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 108,
              lineHeight: 0.95,
              color: "#fff",
              textShadow: `0 0 34px rgba(0,229,255,0.85), 0 0 70px rgba(255,45,248,0.5), 0 6px 0 rgba(0,0,0,0.7)`,
            }}
          >
            ULTIMATE
          </div>
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 96,
              lineHeight: 0.95,
              color: "#fff",
              textShadow: `0 0 30px rgba(57,255,136,0.9), 0 6px 0 rgba(0,0,0,0.7)`,
            }}
          >
            BACKUP DRIVE
          </div>
          <div style={{ marginTop: 10, fontFamily: theme.mono, fontSize: 42, fontWeight: 800, letterSpacing: 4, color: theme.good }}>
            ● VIAL SECURED ●
          </div>
        </div>
      )}

      {/* bottom safe glow line pulsing */}
      <div
        style={{
          position: "absolute",
          top: 1390,
          left: 140,
          right: 140,
          height: 8,
          borderRadius: 4,
          background: theme.good,
          opacity: 0.35 + 0.3 * Math.sin(frame * 0.2),
          boxShadow: "0 0 22px rgba(57,255,136,0.9)",
        }}
      />
    </AbsoluteFill>
  );
}