"use client";

import { motion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";

const CONTEXT_COPY: Record<string, string> = {
  documentation: "Preparing your lesson…",
  sandbox: "Starting sandbox…",
  tests: "Running your code…",
  ai: "Analyzing your attempt…",
  project: "Preparing workspace…",
  default: "Loading…",
};

export type LoadingContext = keyof typeof CONTEXT_COPY;

/** A single sweeping ember bar — the shared visual language for "working" states. */
function SeamBar() {
  return (
    <div className="h-[2px] w-32 overflow-hidden rounded-full bg-hairline">
      <motion.div
        className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-ember to-transparent"
        animate={{ x: ["-120%", "220%"] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: motionTokens.easing.standard }}
      />
    </div>
  );
}

export function LoadingState({
  context = "default",
  className,
}: {
  context?: LoadingContext;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-10 ${className ?? ""}`}>
      <SeamBar />
      <p className="font-mono text-xs uppercase tracking-wide text-text-faint">
        {CONTEXT_COPY[context]}
      </p>
    </div>
  );
}

/** Three-dot "AI is thinking" indicator for the mentor panel — spec §25. */
export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ember"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
