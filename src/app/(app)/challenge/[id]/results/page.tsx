"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/motion/loading-state";
import { challengesApi, type ChallengeDetail } from "@/lib/api";
import { ApiError } from "@/lib/api-client";

export default function ChallengeResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    challengesApi
      .get(id)
      .then(setChallenge)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFoundFlag(true);
      });
  }, [id]);

  if (notFoundFlag) notFound();
  if (!challenge) return <LoadingState context="default" />;

  return (
    <div className="mx-auto max-w-lg text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-signal-pass" />
      <h1 className="mt-4 font-display text-2xl font-medium text-text">
        Challenge passed
      </h1>
      <p className="mt-1.5 text-sm text-text-muted">{challenge.title}</p>

      <Card className="mt-6 text-left">
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-display text-xl text-text">✓</p>
            <p className="mt-1 font-mono text-[10px] uppercase text-text-faint">All tests passed</p>
          </div>
          <div>
            <p className="font-display text-xl text-text">{challenge.hints.length}</p>
            <p className="mt-1 font-mono text-[10px] uppercase text-text-faint">Hints available</p>
          </div>
          <div>
            <p className="font-display text-xl text-text">{challenge.difficulty}</p>
            <p className="mt-1 font-mono text-[10px] uppercase text-text-faint">Difficulty</p>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-text-muted">
        This concept has been added to your review schedule — you&rsquo;ll see it
        again in a few days, in a different form.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Link href="/practice">
          <Button variant="secondary">Back to practice</Button>
        </Link>
        <Link href="/roadmap">
          <Button variant="primary">Continue roadmap →</Button>
        </Link>
      </div>
    </div>
  );
}
