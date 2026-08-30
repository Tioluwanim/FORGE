"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MasteryRing } from "@/components/ui/mastery-ring";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { LoadingState } from "@/components/motion/loading-state";
import { ErrorState } from "@/components/motion/error-state";
import { useAuth } from "@/lib/use-auth";
import { progressApi, type MasteryBreakdown } from "@/lib/api";

export default function ProgressPage() {
  const { tracks, loading: authLoading } = useAuth();
  const [breakdown, setBreakdown] = useState<MasteryBreakdown[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(false);

  function load() {
    setLoadingData(true);
    setLoadError(false);
    progressApi.breakdown().then(setBreakdown).catch(() => setLoadError(true)).finally(() => setLoadingData(false));
  }

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading]);

  if (authLoading || loadingData) return <LoadingState context="default" />;
  if (loadError) return <ErrorState message="Couldn't load your mastery data." onRetry={load} />;

  const sorted = [...breakdown].sort((a, b) => b.overall - a.overall);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return (
    <div className="mx-auto max-w-4xl">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-ember">Progress</p>
        <h1 className="mt-1 font-display text-2xl font-medium text-text">Your Engineering Profile</h1>
      </Reveal>

      <Reveal delay={0.1} className="mt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {tracks.map((t) => (
            <Card key={t.language}>
              <CardContent className="flex items-center gap-4 py-5">
                <MasteryRing value={t.pct} size={56} strokeWidth={5} />
                <div>
                  <p className="font-display text-base text-text">{t.label}</p>
                  <p className="mt-0.5 text-xs text-text-faint">
                    {t.status === "not_started" ? "Not started" : "In progress"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>

      {breakdown.length === 0 ? (
        <p className="mt-8 text-sm text-text-faint">
          Your engineering profile is just getting started — complete a challenge or a
          knowledge check to begin measuring mastery.
        </p>
      ) : (
        <>
          {strongest && weakest && strongest.concept !== weakest.concept && (
            <Reveal delay={0.15} className="mt-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Strongest Skill</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-display text-base text-text">{strongest.concept}</p>
                    <p className="mt-1 text-sm text-text-muted">{strongest.overall}% mastery</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Bottleneck</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-display text-base text-text">{weakest.concept}</p>
                    <p className="mt-1 text-sm text-text-muted">{weakest.overall}% mastery</p>
                    <Link
                      href={`/practice?concept=${encodeURIComponent(weakest.concept)}`}
                      className="mt-2 inline-flex items-center gap-1 text-sm text-ember hover:underline"
                    >
                      Practice this <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </Reveal>
          )}

          <div className="mt-8 space-y-4">
            {breakdown.map((c, i) => (
              <Reveal key={c.concept} delay={0.2 + i * 0.05}>
                <Card>
                  <CardHeader>
                    <CardTitle>{c.concept}</CardTitle>
                    <span className="font-mono text-sm text-text">{c.overall}%</span>
                  </CardHeader>
                  <CardContent className="grid grid-cols-4 gap-4">
                    {(
                      [
                        ["Understanding", c.understanding],
                        ["Implementation", c.implementation],
                        ["Debugging", c.debugging],
                        ["Recall", c.recall],
                      ] as [string, number][]
                    ).map(([label, value]) => (
                      <div key={label}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-muted">{label}</span>
                          <span className="font-mono text-text-faint">{value}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevated">
                          <div
                            className="h-full rounded-full bg-ember transition-[width] duration-700 ease-out"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
