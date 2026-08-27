"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, useInView } from "motion/react";

export function AnimatedNumber({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 24 });

  useEffect(() => {
    if (inView) motionValue.set(reduceMotion ? value : value);
  }, [inView, value, motionValue, reduceMotion]);

  useEffect(() => {
    if (reduceMotion && ref.current) ref.current.textContent = `${value}${suffix}`;
  }, [reduceMotion, value, suffix]);

  useEffect(() => {
    const unsub = spring.on("change", (latest) => {
      if (ref.current && !reduceMotion) {
        ref.current.textContent = `${Math.round(latest)}${suffix}`;
      }
    });
    return unsub;
  }, [spring, suffix, reduceMotion]);

  return (
    <motion.span ref={ref} className={className}>
      0{suffix}
    </motion.span>
  );
}
