"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Server, HardDrive, Database, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";

interface Scenario {
  id: string;
  title: string;
  description: string;
  failingNode: string;
  incidentText: string;
  fixOptions: { id: string; label: string; correct: boolean }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "traffic-spike",
    title: "Traffic spike",
    description: "100 req/min → 20,000 req/min",
    failingNode: "Database",
    incidentText: "Database connections exhausted under load. What would you change?",
    fixOptions: [
      { id: "cache", label: "Add a cache", correct: true },
      { id: "bigger-db", label: "Just add a bigger database", correct: false },
      { id: "queue", label: "Put requests in a queue", correct: false },
    ],
  },
  {
    id: "db-failure",
    title: "Database failure",
    description: "PostgreSQL becomes unavailable",
    failingNode: "Database",
    incidentText: "The primary database is unreachable. What would you change?",
    fixOptions: [
      { id: "replica", label: "Failover to a read replica", correct: true },
      { id: "retry-forever", label: "Retry forever with no backoff", correct: false },
      { id: "restart-api", label: "Restart the API servers", correct: false },
    ],
  },
  {
    id: "cache-failure",
    title: "Cache failure",
    description: "Redis disappears",
    failingNode: "Cache",
    incidentText: "The cache layer is gone and every request is hitting the database directly. What would you change?",
    fixOptions: [
      { id: "graceful-degrade", label: "Degrade gracefully, skip the cache", correct: true },
      { id: "block-writes", label: "Block all writes", correct: false },
      { id: "scale-db-only", label: "Scale the database instead", correct: false },
    ],
  },
  {
    id: "queue-backlog",
    title: "Queue backlog",
    description: "Workers can't keep up",
    failingNode: "Cache",
    incidentText: "Queue depth keeps growing — workers are falling behind. What would you change?",
    fixOptions: [
      { id: "scale-workers", label: "Scale out more workers", correct: true },
      { id: "drop-queue", label: "Drop the queue and process inline", correct: false },
      { id: "bigger-db", label: "Add a bigger database", correct: false },
    ],
  },
];

export default function ProductionPage() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pickedFix, setPickedFix] = useState<string | null>(null);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const picked = scenario.fixOptions.find((f) => f.id === pickedFix);

  function switchScenario(id: string) {
    setScenarioId(id);
    setRunning(false);
    setFailed(false);
    setPickedFix(null);
  }

  function trigger() {
    setRunning(true);
    setFailed(false);
    setPickedFix(null);
    setTimeout(() => setFailed(true), 1800);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-ember">
          Production Simulator
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium text-text">
          Scenario: {scenario.title}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{scenario.description}</p>
      </Reveal>

      {/* System diagram */}
      <Reveal delay={0.1} className="mt-8">
        <div className="flex items-center justify-center gap-6 rounded-md border border-hairline bg-surface p-10">
          {[
            { icon: Server, label: "API" },
            { icon: HardDrive, label: "Cache" },
            { icon: Database, label: "Database" },
          ].map((node, i) => (
            <div key={node.label} className="flex items-center gap-6">
              <motion.div
                animate={
                  failed && node.label === scenario.failingNode
                    ? { borderColor: "#F87171", scale: [1, 1.05, 1] }
                    : {}
                }
                transition={{ duration: 0.6, repeat: failed ? Infinity : 0, repeatType: "reverse" }}
                className={cn(
                  "flex h-20 w-20 flex-col items-center justify-center gap-1.5 rounded-md border bg-elevated",
                  failed && node.label === scenario.failingNode ? "border-signal-fail" : "border-hairline"
                )}
              >
                <node.icon
                  className={cn(
                    "h-5 w-5",
                    failed && node.label === scenario.failingNode ? "text-signal-fail" : "text-text-muted"
                  )}
                />
                <span className="font-mono text-[10px] text-text-faint">{node.label}</span>
              </motion.div>
              {i < 2 && (
                <div className="relative h-px w-10 bg-hairline">
                  {running && (
                    <motion.div
                      className="absolute -top-0.5 h-1 w-1 rounded-full bg-ember"
                      animate={{ x: [0, 40] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Reveal>

      {/* Live metrics */}
      <Reveal delay={0.2} className="mt-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Requests/min", value: running ? "20,000" : "100" },
            { label: "Queue depth", value: failed ? "1,204" : "0" },
            { label: "Latency", value: failed ? "4.8s" : "80ms" },
          ].map((m) => (
            <div key={m.label} className="rounded-md border border-hairline bg-surface p-4 text-center">
              <p className="font-mono text-xl text-text">{m.value}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-text-faint">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <AnimatePresence mode="wait">
        {failed && !picked && (
          <motion.div
            key="incident"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-t-md border border-b-0 border-signal-fail/30 bg-signal-fail/[0.06] px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-signal-fail" />
              <p className="text-sm text-text">{scenario.incidentText}</p>
            </div>
            <div className="flex flex-wrap gap-2 rounded-b-md border border-t-0 border-hairline bg-surface p-3">
              {scenario.fixOptions.map((opt) => (
                <Button key={opt.id} variant="secondary" size="sm" onClick={() => setPickedFix(opt.id)}>
                  {opt.label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
        {picked && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-5 flex items-start gap-2 rounded-md border px-4 py-3 text-sm",
              picked.correct
                ? "border-signal-pass/30 bg-signal-pass/[0.06] text-text"
                : "border-signal-warn/30 bg-signal-warn/[0.06] text-text"
            )}
          >
            {picked.correct ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal-pass" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal-warn" />
            )}
            <p>
              {picked.correct
                ? "That addresses the root cause."
                : `That helps, but it doesn't fully address it — the strongest fix is "${scenario.fixOptions.find((f) => f.correct)?.label}."`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={trigger} disabled={running && !failed}>
          {running && !failed ? "Simulation running…" : "Start simulation"}
        </Button>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.filter((s) => s.id !== scenarioId).map((s) => (
            <button key={s.id} onClick={() => switchScenario(s.id)}>
              <Badge tone="neutral" className="cursor-pointer hover:border-text-faint">
                {s.title}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
