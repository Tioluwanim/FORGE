"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motionTokens } from "@/lib/motion-tokens";

/**
 * Wrap route content in a Next.js `template.tsx` (not `layout.tsx` — templates
 * remount on navigation, which AnimatePresence needs to detect the change).
 * Kept short and subtle per spec §18: "the user must feel the app is fast."
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: motionTokens.durations.fast, ease: motionTokens.easing.standard }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
