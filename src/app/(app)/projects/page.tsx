"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/motion/loading-state";
import { projectsApi, type ProjectSummary } from "@/lib/api";

const DIFFICULTY_TONE: Record<string, "pass" | "warn" | "fail"> = {
  beginner: "pass",
  intermediate: "warn",
  advanced: "fail",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsApi.list().then(setProjects).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState context="project" />;

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Projects</p>
      <h1 className="mt-1 font-display text-2xl font-medium text-text">
        Real engineering assignments
      </h1>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`}>
            <Card className="h-full transition-colors hover:bg-elevated">
              <CardContent className="flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <Badge tone={DIFFICULTY_TONE[p.difficulty] ?? "neutral"}>{p.difficulty}</Badge>
                </div>
                <p className="mt-3 font-display text-lg text-text">{p.title}</p>
                <p className="mt-1.5 flex-1 text-sm text-text-muted">{p.description}</p>
                <div className="mt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full bg-ember"
                      style={{
                        width: `${p.milestones_total ? (p.milestones_done / p.milestones_total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 font-mono text-xs text-text-faint">
                    {p.milestones_done} / {p.milestones_total} milestones
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
