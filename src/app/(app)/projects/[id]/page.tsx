"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/motion/loading-state";
import { projectsApi, type ProjectDetail as ProjectDetailData } from "@/lib/api";
import { ApiError } from "@/lib/api-client";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    projectsApi
      .get(id)
      .then(setProject)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFoundFlag(true);
      });
  }, [id]);

  if (notFoundFlag) notFound();
  if (!project) return <LoadingState context="project" />;

  async function handleOpenWorkspace() {
    setStarting(true);
    try {
      await projectsApi.start(id);
    } finally {
      setStarting(false);
      window.location.href = `/projects/${id}/workspace`;
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Badge tone="info">{project.difficulty}</Badge>
      <h1 className="mt-2 font-display text-2xl font-medium text-text">
        {project.title}
      </h1>
      <p className="mt-2 text-sm text-text-muted">{project.requirements_md}</p>

      <div className="mt-8">
        <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
          Milestones
        </p>
        <div className="mt-3 space-y-2">
          {project.milestones.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-md border border-hairline bg-surface px-4 py-3"
            >
              {m.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-signal-pass" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-text-faint" />
              )}
              <span className={m.done ? "text-sm text-text-muted line-through" : "text-sm text-text"}>
                {m.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="primary"
        className="mt-8 w-full justify-center"
        onClick={handleOpenWorkspace}
        disabled={starting}
      >
        {starting ? "Opening…" : "Open workspace →"}
      </Button>
    </div>
  );
}
