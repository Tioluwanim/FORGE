"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Text } from "@react-three/drei";
import { createElement, useRef } from "react";
import type { Group } from "three";

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
        fontSize={0.2}
        color="#A8A29E"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {text}
      </Text>
    </Float>
  );
}

function ForgeCore() {
  const core = useRef<Group>(null);

  useFrame(({ clock, camera }) => {
    const elapsed = clock.getElapsedTime();
    if (core.current) {
      core.current.rotation.z = elapsed * 0.12;
      core.current.rotation.y = elapsed * 0.2;
    }
    camera.position.x += (Math.sin(elapsed * 0.18) * 0.16 - camera.position.x) * 0.02;
    camera.position.y += (Math.cos(elapsed * 0.15) * 0.1 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return createElement(
    "group",
    { ref: core },
    createElement(
      "mesh",
      { rotation: [Math.PI / 2, 0, 0] },
      createElement("torusGeometry", { args: [1.45, 0.012, 12, 96] }),
      createElement("meshBasicMaterial", { color: "#FF6A39", transparent: true, opacity: 0.65 })
    ),
    createElement(
      "mesh",
      { rotation: [0, Math.PI / 2, Math.PI / 5] },
      createElement("torusGeometry", { args: [1.1, 0.008, 12, 96] }),
      createElement("meshBasicMaterial", { color: "#FBBF24", transparent: true, opacity: 0.4 })
    ),
    createElement(
      "mesh",
      null,
      createElement("icosahedronGeometry", { args: [0.32, 2] }),
      createElement("meshStandardMaterial", {
        color: "#FF6A39",
        emissive: "#FF3D16",
        emissiveIntensity: 2.5,
        roughness: 0.25,
      })
    ),
    createElement("pointLight", { color: "#FF6A39", intensity: 2.5, distance: 5 })
  );
}

/**
 * Rendered only in the landing hero, dynamically imported with ssr:false
 * (see the landing page), never mounted elsewhere.
 */
export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
    >
      {createElement("ambientLight", { intensity: 0.4 })}
      <ForgeCore />
      <Sparkles count={110} scale={[8, 5, 4]} size={2} speed={0.3} color="#FF6A39" opacity={0.55} />
      <Sparkles count={35} scale={[5, 3, 3]} size={4} speed={0.15} color="#FBBF24" opacity={0.3} />
      {FRAGMENTS.map((f) => (
        <CodeFragment key={f.text} text={f.text} position={f.position} />
      ))}
    </Canvas>
  );
}
