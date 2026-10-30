import React from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { ramp } from "./anim";

export type Atom = { pos: [number, number, number]; color?: string; r?: number; at?: number };

/** Ball-and-stick model. Use inside <Scene3D>. Atoms/bonds pop in at their `at` frame. */
export const Molecule3D: React.FC<{ atoms: Atom[]; bonds?: [number, number, number?][] }> = ({ atoms, bonds = [] }) => {
  const frame = useCurrentFrame();
  return (
    <group>
      {atoms.map((a, i) => {
        const s = ramp(frame, a.at ?? 0, 12);
        return (
          <mesh key={i} position={a.pos} scale={s}>
            <sphereGeometry args={[a.r ?? 0.45, 32, 32]} />
            <meshStandardMaterial color={a.color ?? "#4CC9F0"} roughness={0.35} metalness={0.1} />
          </mesh>
        );
      })}
      {bonds.map(([i, j, at], k) => {
        const a = new THREE.Vector3(...atoms[i].pos);
        const b = new THREE.Vector3(...atoms[j].pos);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const dir = b.clone().sub(a);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        const s = ramp(frame, at ?? 0, 12);
        return (
          <mesh key={`b${k}`} position={mid} quaternion={q} scale={[1, s, 1]}>
            <cylinderGeometry args={[0.1, 0.1, dir.length(), 16]} />
            <meshStandardMaterial color="#C9D1E0" />
          </mesh>
        );
      })}
    </group>
  );
};
