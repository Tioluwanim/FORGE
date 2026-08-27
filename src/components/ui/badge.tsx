import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeTone = "neutral" | "pass" | "fail" | "warn" | "info" | "ember";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-elevated text-text-muted border-hairline",
  pass: "bg-signal-pass/10 text-signal-pass border-signal-pass/30",
  fail: "bg-signal-fail/10 text-signal-fail border-signal-fail/30",
  warn: "bg-signal-warn/10 text-signal-warn border-signal-warn/30",
  info: "bg-signal-info/10 text-signal-info border-signal-info/30",
  ember: "bg-ember/10 text-ember border-ember/30",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-xs uppercase tracking-wide",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
