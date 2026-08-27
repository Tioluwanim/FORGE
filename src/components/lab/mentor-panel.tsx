"use client";

import { useState } from "react";
import { Lightbulb, MessageSquareCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ThinkingIndicator } from "@/components/motion/loading-state";

interface MentorPanelProps {
  hints: string[];
}

export function MentorPanel({ hints }: MentorPanelProps) {
  const [revealed, setRevealed] = useState(0);
  const [thinking, setThinking] = useState(false);

  function requestHint() {
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setRevealed((r) => Math.min(r + 1, hints.length));
    }, 700);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
        <MessageSquareCode className="h-3.5 w-3.5 text-ember" />
        <span className="font-mono text-xs uppercase tracking-wide text-text-muted">
          AI Mentor
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {hints.slice(0, revealed).map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-md border border-ember/30 bg-ember/5 px-3 py-2.5 text-sm text-text"
            >
              {h}
            </motion.div>
          ))}
        </AnimatePresence>
        {thinking && (
          <div className="flex items-center gap-2 px-1 py-1.5">
            <ThinkingIndicator />
          </div>
        )}
        {revealed === 0 && !thinking && (
          <p className="text-sm text-text-faint">
            Stuck? Ask for a hint before reaching for the solution — hints get more
            specific each time.
          </p>
        )}
      </div>
      <div className="border-t border-hairline p-3">
        <Button
          variant="secondary"
          className="w-full justify-center"
          disabled={revealed >= hints.length || thinking}
          onClick={requestHint}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {revealed === 0
            ? "Get a hint"
            : revealed >= hints.length
            ? "No more hints"
            : "Get another hint"}
        </Button>
      </div>
    </div>
  );
}
