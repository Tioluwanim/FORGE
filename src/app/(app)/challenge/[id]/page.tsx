"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Play, RotateCcw, Save, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { CodeEditor } from "@/components/lab/code-editor";
import { MentorPanel } from "@/components/lab/mentor-panel";
import { TestResultsPanel, type TestResult } from "@/components/lab/test-result-row";
import { LoadingState } from "@/components/motion/loading-state";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/use-auth";
import { challengesApi, pollSubmission, type ChallengeDetail } from "@/lib/api";
import { ApiError } from "@/lib/api-client";

type MobileTab = "brief" | "editor" | "mentor";

function draftKey(challengeId: string) {
  return `forge:challenge-draft:${challengeId}`;
}

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
  const [runStage, setRunStage] = useState<"queued" | "running" | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [executionMode, setExecutionMode] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("brief");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    challengesApi
      .get(id)
      .then((data) => {
        setChallenge(data);
        const draft = typeof window !== "undefined" ? window.localStorage.getItem(draftKey(id)) : null;
        setCode(draft ?? data.files[0]?.starter_content ?? "");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFoundFlag(true);
      });
  }, [id]);

  if (notFoundFlag) notFound();
  if (authLoading || !challenge) return <LoadingState context="documentation" />;

  function saveDraft() {
    window.localStorage.setItem(draftKey(id), code);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  function resetCode() {
    setCode(challenge!.files[0]?.starter_content ?? "");
    window.localStorage.removeItem(draftKey(id));
    setConfirmReset(false);
  }

  async function runTests() {
    if (!primaryTrack) {
      setSubmitError("Select a language track before submitting.");
      return;
    }
    setRunning(true);
    setRunStage("queued");
    setSubmitError(null);
    setExecutionMode(null);
    setMobileTab("editor");
    try {
      const filePath = challenge!.files[0]?.path ?? "solution.py";
      const ack = await challengesApi.submit(id, primaryTrack.id, { [filePath]: code });
      setRunStage("running");
      const outcome = await pollSubmission(ack.id);
      setExecutionMode(outcome.mode ?? null);
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
      setSubmitError(err instanceof ApiError ? err.message : (err as Error).message || "Submission failed — try again.");
    } finally {
      setRunning(false);
      setRunStage(null);
    }
  }

  const brief = (
    <div className="overflow-y-auto p-5">
      <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
        Requirements
      </p>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        {challenge.description_md}
      </p>
      {challenge.learning_objectives.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
            You&rsquo;ll practice
          </p>
          <ul className="mt-2 space-y-1.5">
            {challenge.learning_objectives.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ember" />
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const editorAndTests = (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden p-3">
        <CodeEditor value={code} onChange={setCode} filename={challenge.files[0]?.path ?? "solution.py"} />
      </div>
      <div className="h-64 overflow-y-auto border-t border-hairline p-3">
        <AnimatePresence mode="wait">
          {running ? (
            <motion.div key="running" exit={{ opacity: 0 }}>
              <LoadingState context={runStage === "queued" ? "sandbox" : "tests"} />
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
              {executionMode === "dev_heuristic_no_execution" && (
                <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-wide text-signal-warn">
                  Heuristic check — real sandboxed execution isn&rsquo;t enabled on this deployment yet
                </p>
              )}
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
  );

  const mentor = (
    <MentorPanel
      hints={challenge.hints.map((h) => h.content_md)}
      context={{
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        challengeDescription: challenge.description_md,
        currentCode: code,
        lastTestSummary: results
          ? results.every((r) => r.passed)
            ? "All tests passing."
            : `Failing: ${results.filter((r) => !r.passed).map((r) => r.name).join(", ")}`
          : undefined,
      }}
    />
  );

  return (
    <div className="-m-8 flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Challenge header */}
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-ember">Challenge</p>
          <h1 className="truncate font-display text-base text-text sm:text-lg">{challenge.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral" className="hidden sm:inline-flex">Difficulty {challenge.difficulty}</Badge>
          <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={saveDraft}>
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
          </Button>
          <Button variant="primary" size="sm" onClick={runTests} disabled={running}>
            <Play className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {runStage === "queued" ? "Queued…" : runStage === "running" ? "Running…" : "Run tests"}
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile tab switcher — desktop shows all three panes at once */}
      <div className="flex border-b border-hairline sm:hidden">
        {([
          ["brief", "Challenge"],
          ["editor", "Editor"],
          ["mentor", "Mentor"],
        ] as [MobileTab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              "flex-1 border-b-2 py-2.5 text-sm",
              mobileTab === tab
                ? "border-ember text-text"
                : "border-transparent text-text-faint"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Desktop: 3-panel layout. Mobile: single active pane from the tabs above. */}
      <div className="hidden flex-1 overflow-hidden sm:grid sm:grid-cols-[280px_1fr_260px]">
        <div className="overflow-y-auto border-r border-hairline">{brief}</div>
        <div className="border-r border-hairline">{editorAndTests}</div>
        {mentor}
      </div>
      <div className="flex-1 overflow-hidden sm:hidden">
        {mobileTab === "brief" && brief}
        {mobileTab === "editor" && editorAndTests}
        {mobileTab === "mentor" && mentor}
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

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset your code?"
        description="This discards your current changes and restores the starter code. This can't be undone."
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)} data-autofocus>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={resetCode}>
            Reset code
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
