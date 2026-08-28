"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/motion/loading-state";
import { curriculumApi, type ConceptDetail } from "@/lib/api";

export default function LearnIndexPage() {
  const [concepts, setConcepts] = useState<ConceptDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    curriculumApi.concepts().then(setConcepts).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState context="documentation" />;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Learn</p>
      <h1 className="mt-1 font-display text-2xl font-medium text-text">Concepts</h1>

      <div className="mt-6 space-y-3">
        {concepts.map((c) => (
          <Link key={c.slug} href={`/learn/${c.slug}`}>
            <Card className="transition-colors hover:bg-elevated">
              <CardContent className="flex items-center justify-between">
                <div>
                  <Badge tone="neutral">{c.module}</Badge>
                  <p className="mt-2 font-display text-base text-text">{c.title}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-faint">
                  <Clock className="h-3.5 w-3.5" />
                  {c.est_minutes} min
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
