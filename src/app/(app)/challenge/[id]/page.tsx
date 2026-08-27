"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Play, RotateCcw, Save } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor, filenameForLanguage } from "@/components/lab/code-editor";
import { MentorPanel } from "@/components/lab/mentor-panel";
import { TestResultsPanel, type TestResult } from "@/components/lab/test-result-row";
import { LoadingState } from "@/components/motion/loading-state";
import { CHALLENGES } from "@/lib/mock-data";

export default function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const challenge = CHALLENGES.find((c) => c.id === id);
  const router = useRouter();

  const [code, setCode] = useState(challenge?.starter ?? "");
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!challenge) {
    notFound();
    return null;
  }

  function runTests() {
    setRunning(true);
    // Simulated execution — real implementation enqueues to the sandbox
    // worker per forge-architecture-plan.md §7 and polls for results.
    setTimeout(() => {
      setResults([
        { name: "Succeeds on first attempt", passed: true, durationMs: 4 },
        { name: "Retries after failure", passed: code.includes("except"), durationMs: 11 },
        { name: "Doubles delay each retry", passed: code.includes("*= 2") || code.includes("* 2"), durationMs: 9 },
        { name: "Gives up after max_attempts", passed: false, durationMs: 6, message: "Expected RuntimeError after 3 attempts, coroutine still retrying" },
        { name: "Hidden edge case", passed: false, hidden: true },
      ]);
      setRunning(false);
    }, 900);
  }

  function resetCode() {
    setCode(challenge.starter);
    setResults(null);
    setSaved(false);
  }

  return (
    <div className="-m-8 flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Challenge header */}
      <div className="flex items-center justify-between border-b border-hairline px-6 py-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">
            {challenge.concept}
          </p>
          <h1 className="font-display text-lg text-text">{challenge.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{challenge.difficulty}</Badge>
          <Button variant="ghost" size="sm" onClick={resetCode} disabled={running}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSaved(true)} disabled={running}>
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
          <Button variant="primary" size="sm" onClick={runTests} disabled={running}>
            <Play className="h-3.5 w-3.5" /> {running ? "Running…" : "Run tests"}
          </Button>
        </div>
      </div>

      {/* Main 3-panel layout */}
      <div className="grid flex-1 grid-cols-[280px_1fr_260px] overflow-hidden">
        {/* Instructions */}
        <div className="overflow-y-auto border-r border-hairline p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
            Requirements
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {challenge.description}
          </p>
        </div>

        {/* Editor + terminal */}
        <div className="flex flex-col overflow-hidden border-r border-hairline">
          <div className="flex-1 overflow-hidden p-3">
            <CodeEditor value={code} onChange={(value) => { setCode(value); setSaved(false); }} filename={filenameForLanguage(challenge.language)} />
          </div>
          <div className="h-64 overflow-y-auto border-t border-hairline p-3">
            <AnimatePresence mode="wait">
              {running ? (
                <motion.div key="running" exit={{ opacity: 0 }}>
                  <LoadingState context="tests" />
                </motion.div>
              ) : results ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <TestResultsPanel results={results} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="flex h-full items-center justify-center text-sm text-text-faint"
                >
                  Run tests to see output here.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* AI Mentor */}
        <MentorPanel hints={challenge.hints} />
      </div>

      {saved && <p className="border-t border-hairline px-6 py-2 text-xs text-signal-pass" role="status">Draft saved in this demo session.</p>}

      <AnimatePresence>
        {results && results.every((r) => r.passed) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-hairline bg-signal-pass/[0.06]"
          >
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-text">All tests passed.</span>
              <Button variant="primary" size="sm" onClick={() => router.push(`/challenge/${id}/results`)}>
                View results →
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
