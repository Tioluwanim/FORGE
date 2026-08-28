"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Mount once, only on the landing page (see spec §42 — custom cursor is a
 * landing-page-only enhancement, not a global app feature). Automatically
 * no-ops on touch devices and when reduced motion is requested.
 */
export function CustomCursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40 });
  const springY = useSpring(y, { stiffness: 500, damping: 40 });

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch || reduceMotion) return;
    setEnabled(true);

    function handleMove(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement;
      const cursorLabel = target.closest("[data-cursor]")?.getAttribute("data-cursor");
      setLabel(cursorLabel ?? null);
    }

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [reduceMotion, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      className="pointer-events-none fixed left-0 top-0 z-[100] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
    >
      <motion.div
        animate={{
          width: label ? "auto" : 8,
          height: label ? 28 : 8,
          paddingInline: label ? 10 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center rounded-full bg-text"
      >
        {label && (
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-wide text-void">
            {label}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
