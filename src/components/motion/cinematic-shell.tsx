"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { NoiseOverlay } from "@/components/motion/backgrounds";
import { PageTransition } from "@/components/motion/page-transition";

const ROUTE_ACCENTS = [
  { match: "/learn", color: "#60A5FA" },
  { match: "/practice", color: "#FBBF24" },
  { match: "/challenge", color: "#F87171" },
  { match: "/projects", color: "#4ADE80" },
  { match: "/system-design", color: "#FF6A39" },
];

function routeAccent(pathname: string) {
  return ROUTE_ACCENTS.find((accent) => pathname.startsWith(accent.match))?.color ?? "#FF6A39";
}

export function CinematicShell({ children, transition = true }: { children: ReactNode; transition?: boolean }) {
  const pathname = usePathname() ?? "/";
  const reduceMotion = useReducedMotion();
  const accent = routeAccent(pathname);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div
        key={accent}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse 55% 42% at 78% 0%, ${accent}16, transparent 70%), radial-gradient(ellipse 45% 36% at 10% 92%, ${accent}0b, transparent 72%)`,
        }}
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern bg-grid opacity-[0.12]" />
      <NoiseOverlay opacity={0.018} />
      <div className="relative z-10">
        {transition ? <PageTransition>{children}</PageTransition> : children}
      </div>
    </div>
  );
}
