"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Route-scoped smooth scroll (spec §42 — only the landing page gets
 * Lenis + GSAP; app pages keep native scroll for predictability inside
 * scrollable panels like the coding lab). Lenis drives GSAP's ticker
 * directly rather than running its own rAF loop, so ScrollTrigger stays
 * in sync — this is Lenis's own documented integration pattern.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => gsap.ticker.remove(update);
  }, [reduceMotion]);

  if (reduceMotion) return <>{children}</>;

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{ autoRaf: false, lerp: 0.1, duration: 1.1 }}
      className="contents"
    >
      {children}
    </ReactLenis>
  );
}
