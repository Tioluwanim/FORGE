"use client";

import { Lock, Check, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

export type RoadmapNodeStatus =
  | "mastered"
  | "learning"
  | "weak"
  | "locked"
  | "recommended"
  | "review_required";

interface RoadmapNodeProps {
  title: string;
  status: RoadmapNodeStatus;
  masteryPct?: number;
  onClick?: () => void;
}

const STATUS_CONFIG: Record<
  RoadmapNodeStatus,
  { icon: React.ComponentType<{ className?: string }>; ring: string; label: string }
> = {
  mastered: { icon: Check, ring: "border-signal-pass/50", label: "Mastered" },
  learning: { icon: Sparkles, ring: "border-ember/60", label: "Learning" },
  weak: { icon: AlertTriangle, ring: "border-signal-warn/50", label: "Weak" },
  locked: { icon: Lock, ring: "border-hairline", label: "Locked" },
  recommended: { icon: Sparkles, ring: "border-ember", label: "Recommended" },
  review_required: {
    icon: RefreshCw,
    ring: "border-signal-info/50",
    label: "Review due",
  },
};

export function RoadmapNode({
  title,
  status,
  masteryPct,
  onClick,
}: RoadmapNodeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const disabled = status === "locked";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex w-64 items-center gap-3 rounded-md border bg-surface px-4 py-3 text-left transition-colors",
        config.ring,
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-elevated cursor-pointer"
      )}
    >
      {status === "recommended" && (
        <span className="forge-seam absolute -inset-px rounded-md opacity-40 pointer-events-none" />
      )}
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border",
          config.ring
        )}
      >
        <Icon className="h-4 w-4 text-text-muted" />
      </span>
      <span className="flex flex-1 flex-col overflow-hidden">
        <span className="truncate text-sm font-medium text-text">{title}</span>
        <span className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
          {config.label}
          {typeof masteryPct === "number" ? ` · ${masteryPct}%` : ""}
        </span>
      </span>
    </button>
  );
}
