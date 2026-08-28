"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { RoadmapNode, type RoadmapNodeStatus } from "@/components/lab/roadmap-node";

const PREVIEW_NODES: { title: string; status: RoadmapNodeStatus; masteryPct?: number; blurb: string }[] = [
  { title: "Python Fundamentals", status: "mastered", masteryPct: 96, blurb: "You've got this — variables, control flow, functions, all solid." },
  { title: "HTTP", status: "mastered", masteryPct: 91, blurb: "Status codes, headers, methods — mastered." },
  { title: "FastAPI", status: "learning", masteryPct: 68, blurb: "Dependency injection is clicking. Routing and validation still need reps." },
  { title: "Databases", status: "weak", masteryPct: 41, blurb: "Connection pooling and transactions are the gap — flagged for review." },
  { title: "Async", status: "recommended", blurb: "Unlocked and ready. This is what FORGE would recommend you start next." },
  { title: "Docker", status: "locked", blurb: "Locked until Async and Databases clear the mastery threshold." },
];

export function RoadmapPreviewDemo() {
  const [selected, setSelected] = useState(2);
  const node = PREVIEW_NODES[selected];

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex flex-wrap gap-2.5 sm:w-1/2">
        {PREVIEW_NODES.map((n, i) => (
          <RoadmapNode
            key={n.title}
            title={n.title}
            status={n.status}
            masteryPct={n.masteryPct}
            onClick={() => setSelected(i)}
          />
        ))}
      </div>
      <motion.div
        key={selected}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-1 flex-col justify-center rounded-md border border-hairline bg-surface p-5"
      >
        <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
          {node.status.replace("_", " ")}
          {typeof node.masteryPct === "number" ? ` · ${node.masteryPct}%` : ""}
        </p>
        <p className="mt-1.5 font-display text-lg text-text">{node.title}</p>
        <p className="mt-2 text-sm text-text-muted">{node.blurb}</p>
      </motion.div>
    </div>
  );
}
