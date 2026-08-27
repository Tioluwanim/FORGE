import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { REVIEWS } from "@/lib/mock-data";

export default function ReviewsPage() {
  const dueToday = REVIEWS.filter((r) => r.dueIn === "Today");

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Reviews</p>
      <h1 className="mt-1 font-display text-2xl font-medium text-text">
        Spaced repetition
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        {dueToday.length} concept{dueToday.length === 1 ? "" : "s"} due today. Question
        format changes each round — this isn&rsquo;t the same quiz twice.
      </p>

      <Stagger className="mt-6 space-y-2.5">
        {REVIEWS.map((r) => (
          <StaggerItem key={r.concept}>
            <div className="flex items-center justify-between rounded-md border border-hairline bg-surface px-4 py-3.5">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4 text-text-faint" />
                <div>
                  <p className="text-sm text-text">{r.concept}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-text-faint">
                    {r.stage}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={r.dueIn === "Today" ? "warn" : "neutral"}>{r.dueIn}</Badge>
                <Button variant="secondary" size="sm" disabled={r.dueIn !== "Today"}>
                  Review
                </Button>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
