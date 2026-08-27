"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { motionTokens } from "@/lib/motion-tokens";

export function Reveal({
  children,
  delay = 0,
  className,
  y = 16,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: motionTokens.durations.slow,
        delay,
        ease: motionTokens.easing.smooth,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Wrap a list of children in Stagger + StaggerItem for a sequential reveal. */
export function Stagger({
  children,
  className,
  gap = motionTokens.stagger.normal,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ visible: { transition: { staggerChildren: gap } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 12,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reduceMotion ? 0 : y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: motionTokens.durations.normal, ease: motionTokens.easing.smooth },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
