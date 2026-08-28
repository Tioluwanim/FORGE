"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Code2, MessageSquareCode, Map } from "lucide-react";
import { cn } from "@/lib/cn";
import { LiveChallengeDemo } from "@/components/marketing/live-challenge-demo";
import { MentorPreviewDemo } from "@/components/marketing/mentor-preview-demo";
import { RoadmapPreviewDemo } from "@/components/marketing/roadmap-preview-demo";

const TABS = [
  { id: "code", label: "Fix real code", icon: Code2 },
  { id: "mentor", label: "Ask the mentor", icon: MessageSquareCode },
  { id: "roadmap", label: "Browse a roadmap", icon: Map },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function InteractiveShowcase() {
  const [active, setActive] = useState<TabId>("code");

  return (
    <div id="try-it" className="mx-auto max-w-3xl scroll-mt-20">
      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors",
              active === tab.id
                ? "border-ember bg-ember/[0.06] text-text"
                : "border-hairline text-text-muted hover:border-text-faint hover:text-text"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {active === "code" && <LiveChallengeDemo />}
            {active === "mentor" && <MentorPreviewDemo />}
            {active === "roadmap" && <RoadmapPreviewDemo />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
