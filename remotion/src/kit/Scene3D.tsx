import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame } from "remotion";
import { theme } from "../theme";

/**
 * Full-frame 3D canvas with house lighting. Children are react-three-fiber elements.
 * If `orbit` is set the whole group rotates `orbit` radians per second around Y (frame-driven).
 */
export const Scene3D: React.FC<{ children: React.ReactNode; orbit?: number; cameraZ?: number }> = ({
  children,
  orbit = 0,
  cameraZ = 9,
}) => {
  const frame = useCurrentFrame();
  return (
    <ThreeCanvas
      width={theme.width}
      height={theme.height}
      style={{ position: "absolute", inset: 0 }}
      camera={{ position: [0, 0, cameraZ], fov: 50 }}
    >
      <color attach="background" args={[theme.bg]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 6]} intensity={1.6} />
      <pointLight position={[-6, -4, 4]} intensity={40} color={theme.accent} />
      <group rotation={[0, (frame / 30) * orbit, 0]}>{children}</group>
    </ThreeCanvas>
  );
};
