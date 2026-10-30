
3D scenes:
- Wrap all 3D content in `<Scene3D orbit={0.3} cameraZ={9}>…</Scene3D>` from "@kit" (it creates the ThreeCanvas, background and lights). Overlay 2D titles/labels as normal React elements AFTER it inside the AbsoluteFill.
- Inside Scene3D use react-three-fiber JSX (`<mesh>`, `<group>`, `<sphereGeometry>`, `<boxGeometry>`, `<torusGeometry>`, `<meshStandardMaterial>`, …) and drei helpers (e.g. `Text`, `Line`, `RoundedBox`, `Sphere`, `Torus`). Do NOT use drei `OrbitControls`, `Environment`, `useGLTF`, textures or anything that loads files.
- Drive every transform from `useCurrentFrame()` — NEVER `useFrame`. Visible area at cameraZ=9 is about x ∈ [-2.3, 2.3], y ∈ [-4.2, 4.2]; keep objects within it (portrait!).
- `Molecule3D` from "@kit" draws ball-and-stick models.
