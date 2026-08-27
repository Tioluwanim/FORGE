"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, FileCode } from "lucide-react";
import { CodeEditor } from "@/components/lab/code-editor";
import { Badge } from "@/components/ui/badge";
import { PROJECTS } from "@/lib/mock-data";

const FILES = ["main.py", "models.py", "routes.py", "tests/test_expenses.py"];

export default function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = PROJECTS.find((p) => p.id === id);
  const [activeFile, setActiveFile] = useState(FILES[0]);
  const [code, setCode] = useState(
    "from fastapi import FastAPI\n\napp = FastAPI()\n\n# TODO: wire up expense routes\n"
  );

  if (!project) notFound();

  return (
    <div className="-m-8 flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center justify-between border-b border-hairline px-6 py-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">Workspace</p>
          <h1 className="font-display text-lg text-text">{project.title}</h1>
        </div>
        <Badge tone="info">{project.difficulty}</Badge>
      </div>

      <div className="grid flex-1 grid-cols-[220px_1fr_260px] overflow-hidden">
        {/* File tree */}
        <div className="overflow-y-auto border-r border-hairline p-3">
          <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-text-faint">
            Files
          </p>
          {FILES.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFile(f)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${
                activeFile === f ? "bg-elevated text-text" : "text-text-muted hover:bg-elevated"
              }`}
            >
              <FileCode className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{f}</span>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="overflow-hidden p-3">
          <CodeEditor value={code} onChange={setCode} filename={activeFile} />
        </div>

        {/* Milestones sidebar */}
        <div className="overflow-y-auto border-l border-hairline p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
            Milestones
          </p>
          <div className="mt-3 space-y-2">
            {project.milestones.map((m) => (
              <div key={m.title} className="flex items-start gap-2">
                {m.done ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-pass" />
                ) : (
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-faint" />
                )}
                <span className={`text-sm ${m.done ? "text-text-muted line-through" : "text-text"}`}>
                  {m.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
