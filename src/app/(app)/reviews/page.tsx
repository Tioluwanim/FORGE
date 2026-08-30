"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { LoadingState } from "@/components/motion/loading-state";
import { ErrorState } from "@/components/motion/error-state";
import { useToast } from "@/components/ui/toast";
import { reviewsApi, type ReviewOut } from "@/lib/api";

export default function ReviewsPage() {
  const toast = useToast();
  const [reviews, setReviews] = useState<ReviewOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setLoadError(false);
    reviewsApi.list().then(setReviews).catch(() => setLoadError(true)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleComplete(id: string) {
    setCompleting(id);
    try {
      const updated = await reviewsApi.complete(id);
      setReviews((rs) => rs.map((r) => (r.id === id ? updated : r)));
    } catch {
      toast("Couldn't mark that as reviewed — try again.", "error");
    } finally {
      setCompleting(null);
    }
  }

  if (loading) return <LoadingState context="default" />;
  if (loadError) return <ErrorState message="Couldn't load your reviews." onRetry={load} />;

  const dueToday = reviews.filter((r) => r.due_in === "Today");

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

      {reviews.length === 0 ? (
        <p className="mt-6 text-sm text-text-faint">
          No reviews scheduled yet — they get created automatically once you master a
          concept.
        </p>
      ) : (
        <Stagger className="mt-6 space-y-2.5">
          {reviews.map((r) => (
            <StaggerItem key={r.id}>
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
                  <Badge tone={r.due_in === "Today" ? "warn" : "neutral"}>{r.due_in}</Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={r.due_in !== "Today" || completing === r.id}
                    onClick={() => handleComplete(r.id)}
                  >
                    {completing === r.id ? "…" : "Review"}
                  </Button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
