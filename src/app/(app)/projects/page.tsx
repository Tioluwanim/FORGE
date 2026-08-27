import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECTS } from "@/lib/mock-data";

const DIFFICULTY_TONE = {
  Beginner: "pass",
  Intermediate: "warn",
  Advanced: "fail",
} as const;

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Projects</p>
      <h1 className="mt-1 font-display text-2xl font-medium text-text">
        Real engineering assignments
      </h1>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {PROJECTS.map((p) => {
          const doneCount = p.milestones.filter((m) => m.done).length;
          return (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="h-full transition-colors hover:bg-elevated">
                <CardContent className="flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <Badge tone={DIFFICULTY_TONE[p.difficulty]}>{p.difficulty}</Badge>
                    <span className="font-mono text-xs text-text-faint">{p.language}</span>
                  </div>
                  <p className="mt-3 font-display text-lg text-text">{p.title}</p>
                  <p className="mt-1.5 flex-1 text-sm text-text-muted">{p.description}</p>
                  <div className="mt-4">
                    <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                      <div
                        className="h-full rounded-full bg-ember"
                        style={{ width: `${(doneCount / p.milestones.length) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1.5 font-mono text-xs text-text-faint">
                      {doneCount} / {p.milestones.length} milestones
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
