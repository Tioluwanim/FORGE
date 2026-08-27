"use client";

import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";

/** Reveals an entire line as a block — for short cinematic statements. */
export function LineReveal({
  children,
  delay = 0,
  className,
}: {
  children: string;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      initial={{ opacity: 0, y: reduceMotion ? 0 : 14, filter: reduceMotion ? "none" : "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ duration: motionTokens.durations.cinematic, delay, ease: motionTokens.easing.cinematic }}
      className={className}
    >
      {children}
    </motion.span>
  );
}

/**
 * Splits text into words and reveals them with a stagger. Use sparingly —
 * spec §9 explicitly warns against making all text type itself out.
 */
export function WordReveal({
  children,
  className,
  wordClassName,
  staggerDelay = motionTokens.stagger.tight,
  startDelay = 0,
}: {
  children: string;
  className?: string;
  wordClassName?: string;
  staggerDelay?: number;
  startDelay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const words = children.split(" ");

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: { transition: { staggerChildren: staggerDelay, delayChildren: startDelay } },
      }}
      className={className}
      aria-label={children}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={{
            hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: motionTokens.durations.normal, ease: motionTokens.easing.smooth },
            },
          }}
          className={`inline-block ${wordClassName ?? ""}`}
          aria-hidden="true"
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
