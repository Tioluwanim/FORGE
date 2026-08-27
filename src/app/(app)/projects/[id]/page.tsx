import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/lib/mock-data";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Badge tone="info">{project.difficulty}</Badge>
      <h1 className="mt-2 font-display text-2xl font-medium text-text">
        {project.title}
      </h1>
      <p className="mt-2 text-sm text-text-muted">{project.description}</p>

      <div className="mt-8">
        <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
          Milestones
        </p>
        <div className="mt-3 space-y-2">
          {project.milestones.map((m) => (
            <div
              key={m.title}
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

      <Link href={`/projects/${project.id}/workspace`}>
        <Button variant="primary" className="mt-8 w-full justify-center">
          Open workspace →
        </Button>
      </Link>
    </div>
  );
}
