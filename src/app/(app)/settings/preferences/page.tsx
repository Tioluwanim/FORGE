"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { LoadingState } from "@/components/motion/loading-state";
import { usersApi, type PreferencesResponse } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";

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
  const { loading: authLoading } = useAuth();
  const [prefs, setPrefs] = useState<PreferencesResponse | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    usersApi.getPreferences().then(setPrefs);
  }, [authLoading]);

  async function update(key: keyof PreferencesResponse, value: boolean) {
    if (!prefs) return;
    setPrefs({ ...prefs, [key]: value }); // optimistic
    setSaving(key);
    try {
      const updated = await usersApi.updatePreferences({ [key]: value });
      setPrefs(updated);
    } finally {
      setSaving(null);
    }
  }

  if (!prefs || authLoading) return <LoadingState context="default" />;

  const rows: { key: keyof PreferencesResponse; label: string; description: string }[] = [
    {
      key: "reduced_motion",
      label: "Reduce motion",
      description: "Minimize animation across the app, overriding system preference.",
    },
    {
      key: "email_digest",
      label: "Weekly email digest",
      description: "A summary of your progress, streak, and weak areas.",
    },
    {
      key: "review_reminders",
      label: "Review reminders",
      description: "Notify me when spaced-repetition reviews are due.",
    },
  ];

  return (
    <div className="divide-y divide-hairline rounded-md border border-hairline bg-surface">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm text-text">{row.label}</p>
            <p className="mt-0.5 text-xs text-text-faint">{row.description}</p>
          </div>
          <Toggle
            checked={prefs[row.key]}
            onChange={(v) => update(row.key, v)}
          />
        </div>
      ))}
    </div>
  );
}
