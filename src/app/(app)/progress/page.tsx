"use client";

import { useEffect, useState } from "react";
import { MasteryRing } from "@/components/ui/mastery-ring";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { LoadingState } from "@/components/motion/loading-state";
import { useAuth } from "@/lib/use-auth";
import { progressApi, type MasteryBreakdown } from "@/lib/api";

export default function ProgressPage() {
  const { tracks, loading: authLoading } = useAuth();
  const [breakdown, setBreakdown] = useState<MasteryBreakdown[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    progressApi.breakdown().then(setBreakdown).finally(() => setLoadingData(false));
  }, [authLoading]);

  if (authLoading || loadingData) return <LoadingState context="default" />;

  return (
    <div className="mx-auto max-w-4xl">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-ember">Progress</p>
        <h1 className="mt-1 font-display text-2xl font-medium text-text">Mastery</h1>
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
          No mastery data yet — submit a challenge or answer a knowledge check to see a
          breakdown here.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {breakdown.map((c, i) => (
            <Reveal key={c.concept} delay={0.15 + i * 0.05}>
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
      )}
    </div>
  );
}
