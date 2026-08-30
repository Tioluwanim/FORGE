"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { tracksApi, usersApi } from "@/lib/api";
import { ApiError } from "@/lib/api-client";

const SKILL_LEVELS = [
  { label: "Complete beginner", value: "beginner" },
  { label: "I know the language", value: "know_language" },
  { label: "I can build small applications", value: "small_apps" },
  { label: "I build APIs", value: "builds_apis" },
  { label: "I'm already working professionally", value: "professional" },
];

const GOALS = [
  "Backend Developer",
  "Full-Stack Developer",
  "Software Engineer",
  "Interview Preparation",
  "System Design",
  "Professional Upskilling",
];

export default function OnboardingPage() {
  const [step, setStep] = useState<"skill" | "goal">("skill");
  const [skill, setSkill] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function finish() {
    const language = sessionStorage.getItem("forge_selected_language");
    if (!language || !skill || !goal) {
      setError("Missing language selection — go back and pick one.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await tracksApi.create(language, skill, true);
      // The goal picked above previously wasn't sent anywhere — persist it
      // to the profile so it isn't silently discarded.
      await usersApi.updateProfile({ goal }).catch(() => {});
      sessionStorage.removeItem("forge_selected_language");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create your track. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "skill") {
    return (
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-ember">Step 2 of 3</p>
        <h1 className="mt-2 font-display text-2xl font-medium text-text">Where are you?</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Be honest — this sets your starting point, not a ceiling.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {SKILL_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => setSkill(level.value)}
              className={cn(
                "rounded-md border px-4 py-3 text-left text-sm transition-colors",
                skill === level.value
                  ? "border-ember bg-ember/[0.04] text-text"
                  : "border-hairline bg-surface text-text-muted hover:border-text-faint"
              )}
            >
              {level.label}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          disabled={!skill}
          className="mt-6 w-full justify-center"
          onClick={() => setStep("goal")}
        >
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Step 3 of 3</p>
      <h1 className="mt-2 font-display text-2xl font-medium text-text">
        What are you trying to become?
      </h1>
      <p className="mt-1.5 text-sm text-text-muted">
        We&rsquo;ll build your roadmap around this.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {GOALS.map((g) => (
          <button
            key={g}
            onClick={() => setGoal(g)}
            className={cn(
              "rounded-md border px-3 py-3 text-left text-sm transition-colors",
              goal === g
                ? "border-ember bg-ember/[0.04] text-text"
                : "border-hairline bg-surface text-text-muted hover:border-text-faint"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-xs text-signal-fail">{error}</p>}

      <Button
        variant="primary"
        disabled={!goal || submitting}
        className="mt-6 w-full justify-center"
        onClick={finish}
      >
        {submitting ? "Setting things up…" : "Build my roadmap"}
      </Button>
    </div>
  );
}
