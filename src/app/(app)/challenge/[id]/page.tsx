"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Play, RotateCcw, Save } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/lab/code-editor";
import { MentorPanel } from "@/components/lab/mentor-panel";
import { TestResultsPanel, type TestResult } from "@/components/lab/test-result-row";
import { LoadingState } from "@/components/motion/loading-state";
import { useAuth } from "@/lib/use-auth";
import { challengesApi, type ChallengeDetail } from "@/lib/api";
import { ApiError } from "@/lib/api-client";

export default function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { primaryTrack, loading: authLoading } = useAuth();

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [code, setCode] = useState("");
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    challengesApi
      .get(id)
      .then((data) => {
        setChallenge(data);
        setCode(data.files[0]?.starter_content ?? "");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFoundFlag(true);
      });
  }, [id]);

  if (notFoundFlag) notFound();
  if (authLoading || !challenge) return <LoadingState context="documentation" />;

  async function runTests() {
    if (!primaryTrack) {
      setSubmitError("Select a language track before submitting.");
      return;
    }
    setRunning(true);
    setSubmitError(null);
    try {
      const filePath = challenge!.files[0]?.path ?? "solution.py";
      const outcome = await challengesApi.submit(id, primaryTrack.id, { [filePath]: code });
      setResults(
        outcome.results.map((r) => ({
          name: r.name,
          passed: r.passed,
          durationMs: r.duration_ms,
          message: r.message ?? undefined,
          hidden: r.hidden,
        }))
      );
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Submission failed — try again.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="-m-8 flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Challenge header */}
      <div className="flex items-center justify-between border-b border-hairline px-6 py-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">Challenge</p>
          <h1 className="font-display text-lg text-text">{challenge.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">Difficulty {challenge.difficulty}</Badge>
          <Button variant="ghost" size="sm" onClick={() => setCode(challenge.files[0]?.starter_content ?? "")}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button variant="secondary" size="sm">
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
            {challenge.description_md}
          </p>
        </div>

        {/* Editor + terminal */}
        <div className="flex flex-col overflow-hidden border-r border-hairline">
          <div className="flex-1 overflow-hidden p-3">
            <CodeEditor value={code} onChange={setCode} filename={challenge.files[0]?.path ?? "solution.py"} />
          </div>
          <div className="h-64 overflow-y-auto border-t border-hairline p-3">
            <AnimatePresence mode="wait">
              {running ? (
                <motion.div key="running" exit={{ opacity: 0 }}>
                  <LoadingState context="tests" />
                </motion.div>
              ) : submitError ? (
                <motion.div key="error" className="flex h-full items-center justify-center text-sm text-signal-fail">
                  {submitError}
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
        <MentorPanel hints={challenge.hints.map((h) => h.content_md)} />
      </div>

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
