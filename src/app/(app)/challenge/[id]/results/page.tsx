"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CHALLENGES } from "@/lib/mock-data";

export default function ChallengeResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const challenge = CHALLENGES.find((c) => c.id === id);
  if (!challenge) notFound();

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
            <p className="font-display text-xl text-text">5/5</p>
            <p className="mt-1 font-mono text-[10px] uppercase text-text-faint">Tests passed</p>
          </div>
          <div>
            <p className="font-display text-xl text-text">2</p>
            <p className="mt-1 font-mono text-[10px] uppercase text-text-faint">Hints used</p>
          </div>
          <div>
            <p className="font-display text-xl text-text">3</p>
            <p className="mt-1 font-mono text-[10px] uppercase text-text-faint">Attempts</p>
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
