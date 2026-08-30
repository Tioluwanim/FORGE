"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";

interface TooltipProps {
  label: string;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom";
  className?: string;
}

/**
 * Wraps a single focusable child and shows a small label on hover/focus.
 * Used where a `title` attribute alone isn't discoverable enough — e.g.
 * the collapsed sidebar's icon-only nav items.
 */
export function Tooltip({ label, children, side = "right", className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  const position =
    side === "right"
      ? "left-full top-1/2 ml-2 -translate-y-1/2"
      : side === "top"
      ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
      : "top-full left-1/2 mt-2 -translate-x-1/2";

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {/* Clone-free wrapper: children get aria-describedby via a sibling span */}
      <span aria-describedby={visible ? id : undefined} className="contents">
        {children}
      </span>
      <AnimatePresence>
        {visible && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "pointer-events-none absolute z-50 whitespace-nowrap rounded border border-hairline bg-elevated px-2 py-1 font-mono text-[10px] text-text",
              position
            )}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
