"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Server, HardDrive, Database, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";

const SCENARIOS = [
  { id: "traffic-spike", title: "Traffic spike", description: "100 req/min → 20,000 req/min" },
  { id: "db-failure", title: "Database failure", description: "PostgreSQL becomes unavailable" },
  { id: "cache-failure", title: "Cache failure", description: "Redis disappears" },
  { id: "queue-backlog", title: "Queue backlog", description: "Workers can't keep up" },
];

export default function ProductionPage() {
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);

  function trigger() {
    setRunning(true);
    setFailed(false);
    setTimeout(() => setFailed(true), 1800);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-ember">
          Production Simulator
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium text-text">
          Scenario: Traffic spike
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
                  failed && node.label === "Database"
                    ? { borderColor: "#F87171", scale: [1, 1.05, 1] }
                    : {}
                }
                transition={{ duration: 0.6, repeat: failed ? Infinity : 0, repeatType: "reverse" }}
                className={cn(
                  "flex h-20 w-20 flex-col items-center justify-center gap-1.5 rounded-md border bg-elevated",
                  failed && node.label === "Database" ? "border-signal-fail" : "border-hairline"
                )}
              >
                <node.icon
                  className={cn(
                    "h-5 w-5",
                    failed && node.label === "Database" ? "text-signal-fail" : "text-text-muted"
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

      <AnimatePresence>
        {failed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-5 flex items-center gap-2 rounded-md border border-signal-fail/30 bg-signal-fail/[0.06] px-4 py-3"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-signal-fail" />
            <p className="text-sm text-text">
              Database connections exhausted under load. What would you change?
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" onClick={trigger} disabled={running}>
          {running ? "Simulation running…" : "Start simulation"}
        </Button>
        <div className="flex gap-2">
          {SCENARIOS.slice(1).map((s) => (
            <Badge key={s.id} tone="neutral">
              {s.title}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
