import { History, CheckCircle2 } from "lucide-react";
import { REVIEWS } from "@/lib/mock-data";

const ACTIVITY = [
  { label: "Completed Fix the N+1 query", detail: "Challenge / Databases", time: "Today" },
  { label: "Reviewed Concurrency", detail: "Spaced review", time: "Yesterday" },
  { label: "Reached FastAPI milestone", detail: "Roadmap / Backend", time: "3 days ago" },
  ...REVIEWS.map((review) => ({ label: `Queued ${review.concept}`, detail: `Review / ${review.stage}`, time: review.dueIn })),
];

export default function ProgressHistoryPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3"><History className="h-5 w-5 text-ember" /><div><p className="font-mono text-xs uppercase tracking-widest text-ember">Progress / History</p><h1 className="mt-1 font-display text-2xl font-medium text-text">Your learning trail</h1></div></div>
      <div className="mt-8 divide-y divide-hairline rounded-md border border-hairline bg-surface">
        {ACTIVITY.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-start gap-3 p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal-pass" /><div className="min-w-0 flex-1"><p className="text-sm text-text">{item.label}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-text-faint">{item.detail}</p></div><span className="shrink-0 text-xs text-text-faint">{item.time}</span></div>
        ))}
      </div>
    </div>
  );
}