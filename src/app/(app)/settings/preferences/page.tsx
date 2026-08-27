"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-ember" : "bg-elevated border border-hairline"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-void transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function SettingsPreferencesPage() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);
  const [reviewReminders, setReviewReminders] = useState(true);

  const rows = [
    {
      label: "Reduce motion",
      description: "Minimize animation across the app, overriding system preference.",
      checked: reducedMotion,
      onChange: setReducedMotion,
    },
    {
      label: "Weekly email digest",
      description: "A summary of your progress, streak, and weak areas.",
      checked: emailDigest,
      onChange: setEmailDigest,
    },
    {
      label: "Review reminders",
      description: "Notify me when spaced-repetition reviews are due.",
      checked: reviewReminders,
      onChange: setReviewReminders,
    },
  ];

  return (
    <div className="divide-y divide-hairline rounded-md border border-hairline bg-surface">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm text-text">{row.label}</p>
            <p className="mt-0.5 text-xs text-text-faint">{row.description}</p>
          </div>
          <Toggle checked={row.checked} onChange={row.onChange} />
        </div>
      ))}
    </div>
  );
}
