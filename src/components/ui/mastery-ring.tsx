"use client";

import { cn } from "@/lib/cn";

interface MasteryRingProps {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

/**
 * Circular mastery indicator. Deliberately not a generic "progress donut" —
 * the arc uses the ember gradient (the product's one signature accent) and
 * the label underneath is the mastery percentage in mono type, treating it
 * like an instrument reading rather than a marketing stat.
 */
export function MasteryRing({
  value,
  size = 96,
  strokeWidth = 6,
  label,
  className,
}: MasteryRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const gradientId = `mastery-ember-${label?.replace(/\s+/g, "-") ?? "ring"}`;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ? label + " " : ""}mastery ${clamped}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B84E2A" />
            <stop offset="100%" stopColor="#FF8F5E" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#26262B"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-lg font-medium text-text">
          {Math.round(clamped)}%
        </span>
        {label && (
          <span className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
