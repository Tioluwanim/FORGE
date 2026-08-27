"use client";

import { useState } from "react";
import { motion, animate, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { Terminal } from "lucide-react";
import { IncidentMetricsPanel } from "@/components/lab/incident-metrics-panel";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { INCIDENTS } from "@/lib/mock-data";

function LatencyReadout() {
  const value = useMotionValue(120);
  const rounded = useTransform(value, (v) => `${Math.round(v)}ms`);

  useEffect(() => {
    const controls = animate(value, 4700, { duration: 2.4, ease: [0.6, 0, 0.4, 1] });
    return controls.stop;
  }, [value]);

  return (
    <motion.span className="font-mono text-3xl text-signal-fail">{rounded}</motion.span>
  );
}

export default function DebugPage() {
  const incident = INCIDENTS[0];
  const [investigating, setInvestigating] = useState(false);

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-signal-fail" />
          <p className="font-mono text-xs uppercase tracking-widest text-signal-fail">
            Incident Active
          </p>
        </div>
        <h1 className="mt-2 font-display text-2xl font-medium text-text">
          {incident.title}
        </h1>
      </Reveal>

      <Reveal delay={0.1} className="mt-6">
        <div className="rounded-md border border-hairline bg-surface p-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
            API Latency (live)
          </p>
          <div className="mt-2">
            <LatencyReadout />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2} className="mt-5">
        <IncidentMetricsPanel incidentId={incident.id} metrics={incident.metrics} />
      </Reveal>

      <Reveal delay={0.3} className="mt-5">
        <div className="rounded-md border border-hairline bg-[#0D0D0F] p-4">
          <div className="flex items-center gap-2 border-b border-hairline pb-2">
            <Terminal className="h-3.5 w-3.5 text-text-faint" />
            <span className="font-mono text-xs uppercase tracking-wide text-text-faint">
              Logs
            </span>
          </div>
          <div className="mt-3 space-y-1.5 font-mono text-xs text-text-muted">
            {incident.logs.map((log, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.15 }}
              >
                {log}
              </motion.p>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" onClick={() => setInvestigating(true)} disabled={investigating}>
          {investigating ? "Investigating…" : "Submit diagnosis"}
        </Button>
      </div>
    </div>
  );
}
