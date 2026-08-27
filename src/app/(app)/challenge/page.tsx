import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CHALLENGES } from "@/lib/mock-data";

export default function ChallengesPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Lab / Challenges</p>
      <h1 className="mt-1 font-display text-2xl font-medium text-text">Build under pressure</h1>
      <p className="mt-2 max-w-xl text-sm text-text-muted">Short, simulated coding exercises that turn concepts into working instincts.</p>
      <div className="mt-8 grid gap-3">
        {CHALLENGES.map((challenge) => (
          <Link key={challenge.id} href={`/challenge/${challenge.id}`} className="group rounded-md border border-hairline bg-surface p-5 transition-colors hover:border-ember/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-display text-lg text-text">{challenge.title}</p><p className="mt-1 text-sm text-text-muted">{challenge.description}</p></div>
              <ArrowRight className="h-4 w-4 text-text-faint transition-transform group-hover:translate-x-1 group-hover:text-ember" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{challenge.language}</Badge><Badge tone="neutral">{challenge.difficulty}</Badge><Badge tone="neutral">{challenge.concept}</Badge>
              <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-text-faint"><Clock3 className="h-3 w-3" /> 15 min</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}