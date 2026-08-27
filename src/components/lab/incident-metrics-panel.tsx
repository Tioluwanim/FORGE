import { cn } from "@/lib/cn";
import { ArrowRight } from "lucide-react";

export interface IncidentMetric {
  label: string;
  from: string;
  to: string;
  severity?: "normal" | "warn" | "critical";
}

const SEVERITY_COLOR: Record<NonNullable<IncidentMetric["severity"]>, string> = {
  normal: "text-signal-pass",
  warn: "text-signal-warn",
  critical: "text-signal-fail",
};

export function IncidentMetricsPanel({
  incidentId,
  metrics,
}: {
  incidentId: string;
  metrics: IncidentMetric[];
}) {
  return (
    <div className="rounded-md border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
        <span className="font-mono text-xs uppercase tracking-wide text-text-faint">
          Incident
        </span>
        <span className="font-mono text-sm text-text">#{incidentId}</span>
      </div>
      <dl className="divide-y divide-hairline">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex items-center justify-between px-5 py-3"
          >
            <dt className="text-sm text-text-muted">{m.label}</dt>
            <dd className="flex items-center gap-2 font-mono text-sm">
              <span className="text-text-faint">{m.from}</span>
              <ArrowRight className="h-3 w-3 text-text-faint" />
              <span
                className={cn(
                  "font-medium",
                  m.severity ? SEVERITY_COLOR[m.severity] : "text-text"
                )}
              >
                {m.to}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
