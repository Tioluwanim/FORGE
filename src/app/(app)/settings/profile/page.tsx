"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/motion/loading-state";
import { usersApi, type ProfileResponse } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";

const GOALS = [
  { value: "backend", label: "Backend Developer" },
  { value: "fullstack", label: "Full-Stack Developer" },
  { value: "swe", label: "Software Engineer" },
  { value: "interview", label: "Interview Preparation" },
  { value: "system_design", label: "System Design" },
  { value: "upskilling", label: "Professional Upskilling" },
];

export default function SettingsProfilePage() {
  const { loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    usersApi.getProfile().then((p) => {
      setProfile(p);
      setDisplayName(p.display_name);
      setBio(p.bio ?? "");
      setGoal(p.goal ?? "backend");
    });
  }, [authLoading]);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await usersApi.updateProfile({ display_name: displayName, bio, goal });
      setProfile(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!profile || authLoading) return <LoadingState context="default" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full border border-hairline bg-elevated" />
        <Button variant="secondary" size="sm" disabled>
          Change avatar
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-text-muted">Display name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-ember"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-text-muted">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Backend engineer in progress."
          className="rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-text-muted">Goal</label>
        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-ember"
        >
          {GOALS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {saved && <span className="text-xs text-signal-pass">Saved.</span>}
      </div>
    </div>
  );
}
