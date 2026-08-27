"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const QUESTIONS = [
  {
    type: "recall" as const,
    prompt: "What does a database transaction guarantee?",
    options: [
      "Faster query execution",
      "Atomicity, consistency, isolation, and durability",
      "Automatic indexing",
      "Reduced storage usage",
    ],
    correct: 1,
  },
  {
    type: "predict" as const,
    prompt: "What will `asyncio.gather(coro1(), coro2())` do if `coro1` raises an exception?",
    options: [
      "Silently ignore it and return coro2's result",
      "Cancel coro2 and re-raise immediately by default",
      "Retry coro1 automatically",
      "Deadlock",
    ],
    correct: 1,
  },
  {
    type: "explain" as const,
    prompt: "Explain why connection pooling improves throughput under load.",
    freeText: true,
  },
];

export default function PracticePage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [freeAnswer, setFreeAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);

  const q = QUESTIONS[index];
  const isCorrect = q.freeText ? true : selected === q.correct;

  function next() {
    setSelected(null);
    setFreeAnswer("");
    setRevealed(false);
    setIndex((i) => Math.min(i + 1, QUESTIONS.length - 1));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-ember">
          Knowledge Check {index + 1} / {QUESTIONS.length}
        </p>
        <Badge tone="neutral">{q.type}</Badge>
      </div>

      <p className="mt-4 font-display text-xl text-text">{q.prompt}</p>

      {q.freeText ? (
        <textarea
          value={freeAnswer}
          onChange={(e) => setFreeAnswer(e.target.value)}
          rows={5}
          placeholder="Write your explanation…"
          className="mt-5 w-full rounded-md border border-hairline bg-surface px-4 py-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
        />
      ) : (
        <div className="mt-5 flex flex-col gap-2.5">
          {q.options!.map((opt, i) => (
            <button
              key={opt}
              onClick={() => !revealed && setSelected(i)}
              disabled={revealed}
              className={cn(
                "rounded-md border px-4 py-3 text-left text-sm transition-colors",
                revealed && i === q.correct && "border-signal-pass bg-signal-pass/10 text-text",
                revealed && i === selected && i !== q.correct && "border-signal-fail bg-signal-fail/10 text-text",
                !revealed && selected === i && "border-ember bg-ember/[0.04] text-text",
                !revealed && selected !== i && "border-hairline bg-surface text-text-muted hover:border-text-faint"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        {!revealed ? (
          <Button
            variant="primary"
            disabled={q.freeText ? freeAnswer.trim().length === 0 : selected === null}
            onClick={() => setRevealed(true)}
          >
            Check answer
          </Button>
        ) : (
          <>
            <Badge tone={isCorrect ? "pass" : "fail"}>
              {q.freeText ? "Submitted for review" : isCorrect ? "Correct" : "Not quite"}
            </Badge>
            <Button
              variant="primary"
              onClick={next}
              disabled={index === QUESTIONS.length - 1}
            >
              Next question →
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
