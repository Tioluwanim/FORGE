"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/motion/loading-state";
import { curriculumApi, questionsApi, type QuestionOut } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";

export default function PracticePage() {
  const { loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<QuestionOut[]>([]);
  const [conceptTitle, setConceptTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [freeAnswer, setFreeAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    async function load() {
      try {
        const concepts = await curriculumApi.concepts();
        if (concepts.length === 0) {
          setLoadError("No concepts seeded yet — run the backend seed script.");
          return;
        }

        // Try each concept in order until one has questions attached —
        // real prioritization (weakest concept first) is a natural upgrade
        // once /dashboard's weak_areas exposes concept ids too.
        for (const c of concepts) {
          const qs = await questionsApi.byConcept(c.id);
          if (qs.length > 0) {
            setQuestions(qs);
            setConceptTitle(c.title);
            return;
          }
        }
        setLoadError("No concepts have questions attached yet in the seed data.");
      } catch {
        setLoadError("Couldn't load practice questions.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authLoading]);

  const q = questions[index];

  async function checkAnswer() {
    if (!q) return;
    setSubmitting(true);
    try {
      const answer = q.answer_format === "mcq" ? selected! : freeAnswer;
      const result = await questionsApi.answer(q.id, answer);
      setCorrect(result.correct);
      setRevealed(true);
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    setSelected(null);
    setFreeAnswer("");
    setRevealed(false);
    setCorrect(null);
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  }

  if (loading || authLoading) return <LoadingState context="default" />;

  if (loadError || questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-ember">Practice</p>
        <p className="mt-4 text-sm text-text-faint">
          {loadError ??
            `No questions are attached to "${conceptTitle}" yet in the seed data — add some via the questions table, or extend the seed script.`}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-ember">
          Knowledge Check {index + 1} / {questions.length}
        </p>
        <Badge tone="neutral">{q.type}</Badge>
      </div>

      <p className="mt-4 font-display text-xl text-text">{q.prompt_md}</p>

      {q.answer_format === "mcq" && q.options ? (
        <div className="mt-5 flex flex-col gap-2.5">
          {q.options.map((opt, i) => (
            <button
              key={opt}
              onClick={() => !revealed && setSelected(i)}
              disabled={revealed}
              className={cn(
                "rounded-md border px-4 py-3 text-left text-sm transition-colors",
                revealed && correct && i === selected && "border-signal-pass bg-signal-pass/10 text-text",
                revealed && !correct && i === selected && "border-signal-fail bg-signal-fail/10 text-text",
                !revealed && selected === i && "border-ember bg-ember/[0.04] text-text",
                !revealed && selected !== i && "border-hairline bg-surface text-text-muted hover:border-text-faint"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <textarea
          value={freeAnswer}
          onChange={(e) => setFreeAnswer(e.target.value)}
          rows={5}
          disabled={revealed}
          placeholder="Write your explanation…"
          className="mt-5 w-full rounded-md border border-hairline bg-surface px-4 py-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
        />
      )}

      <div className="mt-6 flex items-center gap-3">
        {!revealed ? (
          <Button
            variant="primary"
            disabled={
              submitting ||
              (q.answer_format === "mcq" ? selected === null : freeAnswer.trim().length === 0)
            }
            onClick={checkAnswer}
          >
            {submitting ? "Checking…" : "Check answer"}
          </Button>
        ) : (
          <>
            <Badge tone={correct === null ? "info" : correct ? "pass" : "fail"}>
              {correct === null ? "Submitted for review" : correct ? "Correct" : "Not quite"}
            </Badge>
            <Button variant="primary" onClick={next} disabled={index === questions.length - 1}>
              Next question →
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
