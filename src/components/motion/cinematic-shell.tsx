"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { NoiseOverlay } from "@/components/motion/backgrounds";

const ROUTE_ACCENTS = [
  { match: "/learn", color: "#60A5FA" },
  { match: "/documentation", color: "#60A5FA" },
  { match: "/practice", color: "#FBBF24" },
  { match: "/challenge", color: "#F87171" },
  { match: "/debug", color: "#F87171" },
  { match: "/projects", color: "#4ADE80" },
  { match: "/system-design", color: "#FF6A39" },
  { match: "/production", color: "#F87171" },
  { match: "/ai-mentor", color: "#FF6A39" },
];

function routeAccent(pathname: string): string {
  return ROUTE_ACCENTS.find((accent) => pathname.startsWith(accent.match))?.color ?? "#FF6A39";
}

/**
 * Wraps app-shell content in a subtle, route-tinted ambient background —
 * gives each section of the product a faint distinct "temperature" (blue for
 * learning, amber for practice, red for debug/production, green for
 * projects) without any component needing to know about it. Purely
 * atmospheric — never affects layout or interaction.
 */
export function CinematicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const reduceMotion = useReducedMotion();
  const accent = routeAccent(pathname);

  return (
    <div className="relative min-h-screen">
      <motion.div
        key={accent}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse 55% 42% at 82% 0%, ${accent}14, transparent 70%), radial-gradient(ellipse 45% 36% at 6% 96%, ${accent}0a, transparent 72%)`,
        }}
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
      <NoiseOverlay opacity={0.015} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
