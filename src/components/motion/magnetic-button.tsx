"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/cn";
import { motionTokens } from "@/lib/motion-tokens";

interface MagneticButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  /** Maximum pixel offset the button can be pulled — keep this small (spec: "do not allow excessive movement"). */
  strength?: number;
  as?: "button" | "a";
  href?: string;
}

export function MagneticButton({
  children,
  className,
  strength = 10,
  as = "button",
  href,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, motionTokens.spring.responsive);
  const springY = useSpring(y, motionTokens.spring.responsive);

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
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

  const MotionElement = (as === "a" ? motion.a : motion.button) as typeof motion.button;

  return (
    <MotionElement
      ref={ref as React.Ref<HTMLButtonElement>}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={reduceMotion ? undefined : { x: springX, y: springY }}
      href={href}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md bg-ember px-6 py-3 text-sm font-medium text-void transition-colors hover:bg-ember-glow",
        className
      )}
      {...props}
    >
      {children}
    </MotionElement>
  );
}
