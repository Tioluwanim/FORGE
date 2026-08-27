"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

const SKILL_LEVELS = [
  "Complete beginner",
  "I know the language",
  "I can build small applications",
  "I build APIs",
  "I'm already working professionally",
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
  const router = useRouter();

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
              key={level}
              onClick={() => setSkill(level)}
              className={cn(
                "rounded-md border px-4 py-3 text-left text-sm transition-colors",
                skill === level
                  ? "border-ember bg-ember/[0.04] text-text"
                  : "border-hairline bg-surface text-text-muted hover:border-text-faint"
              )}
            >
              {level}
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

      <Button
        variant="primary"
        disabled={!goal}
        className="mt-6 w-full justify-center"
        onClick={() => router.push("/dashboard")}
      >
        Build my roadmap
      </Button>
    </div>
  );
}
