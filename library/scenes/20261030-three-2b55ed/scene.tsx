import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme, sec, Appear, Title, Scene3D, useSpringAt } from "@kit";
import * as THREE from "three";
import { Line } from "@react-three/drei";

export default function Scene() {
  const frame = useCurrentFrame();
  const bPic = sec(13.08);
  const bSlice = sec(14.14);
  const bAir = sec(16.6);
  const bTilt = sec(17.6);
  const bAbout = sec(18.6);
  const bThree = sec(18.82);

  const arrowGrow = useSpringAt(sec(18.82), 14);

  const wingX =
    interpolate(frame, [bSlice, bSlice + 35], [-0.55, 0.35], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) + Math.sin(frame * 0.08) * 0.03;

  const wingY = 0.45 + Math.sin(frame * 0.06) * 0.04;

  const tilt = interpolate(frame, [bTilt, bTilt + 20], [0, 0.0524], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const down = interpolate(frame, [bAir, bAbout + 10], [0, 1.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const puffOp = interpolate(frame, [bPic, bPic + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const trailOp =
    interpolate(frame, [bPic, bAbout], [0.25, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    Math.max(0.001, puffOp);

  const arcOp = interpolate(frame, [bTilt, bTilt + 12], [0, 0.65], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const camZ = interpolate(frame, [0, 575], [10.8, 8.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const arrowS = Math.max(0.001, arrowGrow * 1.35);
  const arrowOp = interpolate(arrowGrow, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const wingGeo = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.6, 0);
    s.bezierCurveTo(-0.8, 0.28, 0.2, 0.45, 1.2, 0.25);
    s.bezierCurveTo(1.55, 0.18, 1.55, -0.18, 1.2, -0.25);
    s.bezierCurveTo(0.2, -0.45, -0.8, -0.28, -1.6, 0);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 1.6,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 2,
      curveSegments: 24,
    });
    g.center();
    return g;
  }, []);

  const bases = [0.95, 0.38, -0.38, -0.95];
  const zList = [0.45, 0.05, -0.15, 0.4];

  const getPathY = (xx: number, base: number) => {
    const rel = xx - wingX;
    const bump =
      base > 0
        ? 0.38 * Math.exp(-(rel * rel) / 1.4)
        : -0.14 * Math.exp(-(rel * rel) / 0.9);
    const after = Math.max(0, xx - (wingX + 0.95));
    const drop = down * after * (base > 0 ? 0.9 : 1.05);
    return wingY + base + bump - drop;
  };

  const puffs = bases.map((base, i) => {
    const off = i * 30;
    const period = 120;
    const mod = (((frame - bPic + off) % period) + period) % period;
    const cyc = mod / period;
    const x = -3.4 + cyc * 6.9;
    const z = zList[i];
    const y = getPathY(x, base);
    const trail: [number, number, number][] = [];
    for (let j = 26; j >= 0; j--) {
      const xx = x - j * 0.15;
      trail.push([xx, getPathY(xx, base), z]);
    }
    return { x, y, z, trail };
  });

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Scene3D orbit={0.3} cameraZ={camZ}>
        <group>
          <group position={[wingX, wingY, 0]} rotation={[0, 0.35, tilt]}>
            <mesh geometry={wingGeo}>
              <meshStandardMaterial
                color={theme.muted}
                metalness={0.85}
                roughness={0.32}
                emissive={theme.fg}
                emissiveIntensity={0.08}
              />
            </mesh>
            <mesh position={[0.1, 0.33, 0]}>
              <boxGeometry args={[2.3, 0.05, 1.5]} />
              <meshStandardMaterial
                color={theme.fg}
                emissive={theme.fg}
                emissiveIntensity={0.55}
                transparent
                opacity={0.85}
              />
            </mesh>
            <mesh position={[1.15, 0.05, 0.9]} rotation={[0, 0, -0.15]}>
              <torusGeometry args={[0.85, 0.022, 10, 40, 0.6]} />
              <meshBasicMaterial
                color={theme.accent3}
                transparent
                opacity={arcOp}
              />
            </mesh>
          </group>

          {puffs.map((p, i) => (
            <group key={i}>
              <Line
                points={p.trail}
                color={theme.accent}
                lineWidth={4}
                transparent
                opacity={trailOp}
              />
              <mesh position={[p.x, p.y, p.z]}>
                <sphereGeometry args={[0.13, 20, 20]} />
                <meshStandardMaterial
                  color={theme.accent}
                  emissive={theme.accent}
                  emissiveIntensity={2.6}
                  transparent
                  opacity={puffOp}
                />
              </mesh>
            </group>
          ))}

          <group
            position={[wingX + 0.15, wingY + 0.35, 0.2]}
            scale={[arrowS, arrowS, arrowS]}
          >
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 1.6, 20]} />
              <meshStandardMaterial
                color={theme.accent3}
                emissive={theme.accent3}
                emissiveIntensity={2.2}
                transparent
                opacity={arrowOp}
              />
            </mesh>
            <mesh position={[0, 1.9, 0]}>
              <coneGeometry args={[0.34, 0.7, 24]} />
              <meshStandardMaterial
                color={theme.accent3}
                emissive={theme.accent3}
                emissiveIntensity={2.2}
                transparent
                opacity={arrowOp}
              />
            </mesh>
          </group>
        </group>
      </Scene3D>

      <Title text="Picture one wing" at={bPic} size={96} y={280} />

      <Appear
        at={bSlice}
        outAt={bAir}
        style={{ position: "absolute", top: 470, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            display: "inline-block",
            color: theme.accent,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 58,
            background: "rgba(0,0,0,0.55)",
            padding: "10px 34px",
            borderRadius: 999,
            border: `2px solid ${theme.accent}`,
          }}
        >
          slicing forward
        </div>
      </Appear>

      <Appear
        at={bAir}
        outAt={bTilt}
        style={{ position: "absolute", top: 470, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            display: "inline-block",
            color: theme.fg,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 58,
            background: "rgba(0,0,0,0.55)",
            padding: "10px 34px",
            borderRadius: 999,
            border: `2px solid ${theme.fg}`,
          }}
        >
          meets still air
        </div>
      </Appear>

      <Appear
        at={bTilt}
        outAt={bAbout}
        style={{ position: "absolute", top: 470, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            display: "inline-block",
            color: theme.accent3,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 62,
            background: "rgba(0,0,0,0.55)",
            padding: "10px 34px",
            borderRadius: 999,
            border: `2px solid ${theme.accent3}`,
          }}
        >
          slight tilt • 3°
        </div>
      </Appear>

      <Appear
        at={bAbout}
        style={{ position: "absolute", top: 1230, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            color: theme.accent,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 72,
            letterSpacing: 2,
            textShadow: "0 4px 30px rgba(0,0,0,0.8)",
          }}
        >
          DOWNWASH
        </div>
      </Appear>

      <Appear
        at={bThree}
        style={{ position: "absolute", top: 1320, width: "100%", textAlign: "center" }}
      >
        <div
          style={{
            display: "inline-block",
            color: theme.bg,
            fontFamily: theme.font,
            fontWeight: 900,
            fontSize: 56,
            background: theme.accent3,
            padding: "8px 32px",
            borderRadius: 18,
          }}
        >
          pushed UP
        </div>
      </Appear>
    </AbsoluteFill>
  );
}