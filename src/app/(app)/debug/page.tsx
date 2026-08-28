"use client";

import { useEffect, useState } from "react";
import { motion, animate, useMotionValue, useTransform } from "motion/react";
import { Terminal } from "lucide-react";
import { IncidentMetricsPanel, type IncidentMetric } from "@/components/lab/incident-metrics-panel";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { LoadingState } from "@/components/motion/loading-state";
import { incidentsApi, type IncidentDetail } from "@/lib/api";

function LatencyReadout({ toMs }: { toMs: number }) {
  const value = useMotionValue(120);
  const rounded = useTransform(value, (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}s` : `${Math.round(v)}ms`));

  useEffect(() => {
    const controls = animate(value, toMs, { duration: 2.4, ease: [0.6, 0, 0.4, 1] });
    return controls.stop;
  }, [value, toMs]);

  return <motion.span className="font-mono text-3xl text-signal-fail">{rounded}</motion.span>;
}

function parseMs(display: string): number {
  if (display.endsWith("ms")) return parseFloat(display);
  if (display.endsWith("s")) return parseFloat(display) * 1000;
  return 0;
}

export default function DebugPage() {
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [result, setResult] = useState<{ is_correct: boolean; root_cause_md: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    incidentsApi.list().then((incidents) => {
      if (incidents[0]) setIncidentId(incidents[0].id);
    });
  }, []);

  useEffect(() => {
    if (!incidentId) return;
    incidentsApi.get(incidentId).then(setIncident);
  }, [incidentId]);

  if (!incident) return <LoadingState context="default" />;

  const metrics: IncidentMetric[] = Object.entries(incident.metrics).map(([label, m]) => ({
    label: label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    from: m.from,
    to: m.to,
    severity: m.severity as IncidentMetric["severity"],
  }));
  const apiLatency = incident.metrics["api_latency"];

  async function submitDiagnosis() {
    if (!incidentId || !diagnosis.trim()) return;
    setSubmitting(true);
    try {
      const res = await incidentsApi.diagnose(incidentId, diagnosis);
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

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

      {apiLatency && (
        <Reveal delay={0.1} className="mt-6">
          <div className="rounded-md border border-hairline bg-surface p-6 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
              API Latency (live)
            </p>
            <div className="mt-2">
              <LatencyReadout toMs={parseMs(apiLatency.to)} />
            </div>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.2} className="mt-5">
        <IncidentMetricsPanel incidentId={incident.id} metrics={metrics} />
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
            {incident.logs.lines.map((log, i) => (
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

      {result ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 rounded-md border px-4 py-3 text-sm ${
            result.is_correct
              ? "border-signal-pass/30 bg-signal-pass/[0.06] text-text"
              : "border-signal-warn/30 bg-signal-warn/[0.06] text-text"
          }`}
        >
          <p className="font-medium">{result.is_correct ? "Correct diagnosis." : "Not quite — here's the root cause:"}</p>
          <p className="mt-1.5 text-text-muted">{result.root_cause_md}</p>
        </motion.div>
      ) : (
        <>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            rows={3}
            placeholder="What's causing this incident?"
            className="mt-6 w-full rounded-md border border-hairline bg-surface px-4 py-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
          />
          <div className="mt-3 flex justify-end">
            <Button variant="primary" onClick={submitDiagnosis} disabled={submitting || !diagnosis.trim()}>
              {submitting ? "Submitting…" : "Submit diagnosis"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
