"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

/** Faint fixed grid — the base depth layer used across the app (also in globals.css for non-hero pages). */
export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-40 ${className ?? ""}`}
    />
  );
}

/** Subtle animated radial glow — used once per section max, never stacked. */
export function GlowField({
  color = "#FF6A39",
  className,
}: {
  color?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
      style={{
        background: `radial-gradient(circle at 50% 30%, ${color}14, transparent 60%)`,
      }}
      animate={reduceMotion ? undefined : { opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/** Lightweight CSS/SVG particle drift — used only in the hero, never site-wide. */
export function ParticleField({
  count = 24,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 8 + 10,
        delay: Math.random() * 4,
      })),
    [count]
  );

  if (reduceMotion) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-ember/40"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** Grain/noise texture overlay — extremely subtle, purely tactile. */
export function NoiseOverlay({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
