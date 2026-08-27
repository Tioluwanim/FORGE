"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { id: "python", name: "Python", tagline: "FastAPI, async, system design" },
  { id: "javascript", name: "JavaScript", tagline: "Node.js, Express, the event loop" },
  { id: "java", name: "Java", tagline: "Spring Boot, JPA, concurrency" },
];

export default function SelectLanguagePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryLanguage = searchParams.get("language");
  const selectedLanguage = LANGUAGES.some((item) => item.id === queryLanguage)
    ? queryLanguage
    : selected;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Step 1 of 3</p>
      <h1 className="mt-2 font-display text-2xl font-medium text-text">
        What do you want to learn?
      </h1>
      <p className="mt-1.5 text-sm text-text-muted">
        You can add more tracks later — progress stays separate per language.
      </p>

      <div className="mt-6 flex flex-col gap-2.5">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            type="button"
            aria-pressed={selectedLanguage === lang.id}
            onClick={() => setSelected(lang.id)}
            className={cn(
              "rounded-md border bg-surface px-4 py-3.5 text-left transition-colors",
              selectedLanguage === lang.id
                ? "border-ember bg-ember/[0.04]"
                : "border-hairline hover:border-text-faint"
            )}
          >
            <p className="font-display text-base text-text">{lang.name}</p>
            <p className="mt-0.5 text-xs text-text-muted">{lang.tagline}</p>
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        disabled={!selectedLanguage}
        className="mt-6 w-full justify-center"
        onClick={() => router.push(`/onboarding?language=${selectedLanguage}`)}
      >
        Continue
      </Button>
    </div>
  );
}
