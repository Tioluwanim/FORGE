"use client";

import { Canvas } from "@react-three/fiber";
import { Float, Sparkles, Text } from "@react-three/drei";

const FRAGMENTS = [
  { text: "async def retry():", position: [-3.2, 1.4, -2] as [number, number, number] },
  { text: "SELECT * FROM orders", position: [3, -0.8, -3] as [number, number, number] },
  { text: "docker run --rm", position: [-2.4, -1.6, -1.5] as [number, number, number] },
  { text: "test_expenses.py", position: [2.8, 1.8, -2.5] as [number, number, number] },
];

function CodeFragment({
  text,
  position,
}: {
  text: string;
  position: [number, number, number];
}) {
  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
      <Text
        position={position}
        fontSize={0.22}
        color="#5A5A61"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {text}
      </Text>
    </Float>
  );
}

/**
 * Deliberately minimal — a few drifting code fragments plus an ember
 * sparkle field. Rendered only in the landing hero, dynamically imported
 * with ssr:false (see the landing page), never mounted elsewhere.
 */
export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.4} />
      <Sparkles count={60} scale={[8, 5, 4]} size={2} speed={0.25} color="#FF6A39" opacity={0.5} />
      {FRAGMENTS.map((f) => (
        <CodeFragment key={f.text} text={f.text} position={f.position} />
      ))}
    </Canvas>
  );
}
