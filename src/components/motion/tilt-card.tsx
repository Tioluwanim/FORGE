"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { motionTokens } from "@/lib/motion-tokens";

export function TiltCard({
  children,
  className,
  maxTilt = 6,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [maxTilt, -maxTilt]), motionTokens.spring.soft);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-maxTilt, maxTilt]), motionTokens.spring.soft);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      style={
        reduceMotion
          ? undefined
          : { rotateX, rotateY, transformPerspective: 800 }
      }
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: motionTokens.durations.fast }}
      className={cn("cursor-pointer will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
