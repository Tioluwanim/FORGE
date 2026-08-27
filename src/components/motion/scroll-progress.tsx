"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-50 h-[2px] w-full origin-left bg-gradient-to-r from-ember-dim via-ember to-ember-glow"
    />
  );
}
