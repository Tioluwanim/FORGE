"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Server, HardDrive, Database, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";

const SCENARIOS = [
  { id: "traffic-spike", title: "Traffic spike", description: "100 req/min to 20,000 req/min", failure: "API", metrics: ["20,000", "1,204", "4.8s"] },
  { id: "db-failure", title: "Database failure", description: "PostgreSQL becomes unavailable", failure: "Database", metrics: ["100", "890", "3.2s"] },
  { id: "cache-failure", title: "Cache failure", description: "Redis disappears", failure: "Cache", metrics: ["100", "340", "1.9s"] },
  { id: "queue-backlog", title: "Queue backlog", description: "Workers cannot keep up", failure: "Queue", metrics: ["2,400", "8,920", "2.6s"] },
];

export default function ProductionPage() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [phase, setPhase] = useState<"idle" | "running" | "failure" | "investigation" | "resolved">("idle");
  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0];

  useEffect(() => {
    if (phase !== "running") return;
    const timer = window.setTimeout(() => setPhase("failure"), 1400);
    return () => window.clearTimeout(timer);
  }, [phase]);

  function trigger() {
    setPhase("running");
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
                  phase === "failure" && node.label === scenario.failure
                    ? { borderColor: "#F87171", scale: [1, 1.05, 1] }
                    : {}
                }
                transition={{ duration: 0.6, repeat: phase === "failure" ? Infinity : 0, repeatType: "reverse" }}
                className={cn(
                  "flex h-20 w-20 flex-col items-center justify-center gap-1.5 rounded-md border bg-elevated",
                  phase === "failure" && node.label === scenario.failure ? "border-signal-fail" : "border-hairline"
                )}
              >
                <node.icon
                  className={cn(
                    "h-5 w-5",
                    phase === "failure" && node.label === scenario.failure ? "text-signal-fail" : "text-text-muted"
                  )}
                />
                <span className="font-mono text-[10px] text-text-faint">{node.label}</span>
              </motion.div>
              {i < 2 && (
                <div className="relative h-px w-10 bg-hairline">
                  {phase === "running" && (
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
            { label: "Requests/min", value: phase === "failure" ? scenario.metrics[0] : "100" },
            { label: "Queue depth", value: phase === "failure" ? scenario.metrics[1] : "0" },
            { label: "Latency", value: phase === "failure" ? scenario.metrics[2] : "80ms" },
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

      <AnimatePresence>
        {phase === "failure" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-5 flex items-center gap-2 rounded-md border border-signal-fail/30 bg-signal-fail/[0.06] px-4 py-3"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-signal-fail" />
            <p className="text-sm text-text">
              {scenario.failure} is degraded. Investigate the signal, then choose a recovery action.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" onClick={trigger} disabled={phase === "running"}>
          {phase === "running" ? "Simulation running…" : phase === "resolved" ? "Run again" : "Start simulation"}
        </Button>
        <div className="flex gap-2">
          {SCENARIOS.map((s) => (
            <button key={s.id} type="button" onClick={() => { setScenarioId(s.id); setPhase("idle"); }} aria-pressed={scenarioId === s.id} className={cn("rounded border px-2 py-1 text-xs", scenarioId === s.id ? "border-ember text-text" : "border-hairline text-text-muted")}>
              <Badge tone="neutral">{s.title}</Badge>
            </button>
          ))}
        </div>
        {phase === "failure" && <Button variant="secondary" onClick={() => setPhase("investigation")}>Investigate</Button>}
        {phase === "investigation" && <Button variant="primary" onClick={() => setPhase("resolved")}>Mark resolved</Button>}
        {phase === "resolved" && <span className="text-sm text-signal-pass" role="status">Scenario resolved in the demo environment.</span>}
      </div>
    </div>
  );
}
