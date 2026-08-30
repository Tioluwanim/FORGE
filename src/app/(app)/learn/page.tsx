"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/motion/loading-state";
import { ErrorState } from "@/components/motion/error-state";
import { curriculumApi, progressApi, type ConceptDetail, type MasteryBreakdown } from "@/lib/api";

export default function LearnIndexPage() {
  const [concepts, setConcepts] = useState<ConceptDetail[]>([]);
  const [breakdown, setBreakdown] = useState<MasteryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  function load() {
    setLoading(true);
    setLoadError(false);
    Promise.all([curriculumApi.concepts(), progressApi.breakdown()])
      .then(([c, b]) => {
        setConcepts(c);
        setBreakdown(b);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingState context="documentation" />;
  if (loadError) return <ErrorState message="Couldn't load your concepts." onRetry={load} />;

  const modules = concepts.reduce<Record<string, ConceptDetail[]>>((acc, c) => {
    (acc[c.module] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Learn</p>
      <h1 className="mt-1 font-display text-2xl font-medium text-text">Concepts</h1>

      {concepts.length === 0 ? (
        <p className="mt-6 text-sm text-text-faint">
          Your concept library is empty right now — check back soon.
        </p>
      ) : (
        Object.entries(modules).map(([module, items]) => (
          <div key={module} className="mt-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-faint">
              {module}
            </p>
            <div className="mt-3 space-y-3">
              {items.map((c) => {
                const mastery = breakdown.find((b) => b.concept === c.title);
                return (
                  <Link key={c.slug} href={`/learn/${c.slug}`}>
                    <Card className="transition-colors hover:bg-elevated">
                      <CardContent className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-base text-text">{c.title}</p>
                          {mastery ? (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1 flex-1 max-w-[10rem] overflow-hidden rounded-full bg-elevated">
                                <div
                                  className="h-full rounded-full bg-ember"
                                  style={{ width: `${mastery.overall}%` }}
                                />
                              </div>
                              <span className="font-mono text-[10px] text-text-faint">
                                {mastery.overall}%
                              </span>
                            </div>
                          ) : (
                            <Badge tone="neutral" className="mt-2">Not started</Badge>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 text-xs text-text-faint">
                          <Clock className="h-3.5 w-3.5" />
                          {c.est_minutes} min
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
