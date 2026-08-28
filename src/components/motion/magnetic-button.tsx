"use client";

import { useRef, type ReactNode, type ButtonHTMLAttributes } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { motionTokens } from "@/lib/motion-tokens";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Maximum pixel offset the button can be pulled — keep this small (spec: "do not allow excessive movement"). */
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  strength = 10,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, motionTokens.spring.responsive);
  const springY = useSpring(y, motionTokens.spring.responsive);

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set((relX / rect.width) * strength);
    y.set((relY / rect.height) * strength);
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={reduceMotion ? undefined : { x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md bg-ember px-6 py-3 text-sm font-medium text-void transition-colors hover:bg-ember-glow",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
