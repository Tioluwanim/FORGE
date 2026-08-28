"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Map,
  Dumbbell,
  MessageSquareCode,
  FileText,
  Play,
  FolderGit2,
  AlertTriangle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface Command {
  id: string;
  label: string;
  group: "Navigate" | "Actions";
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

function useCommands(): Command[] {
  return useMemo(
    () => [
      { id: "roadmap", label: "Go to roadmap", group: "Navigate", icon: Map, run: () => (window.location.href = "/roadmap") },
      { id: "practice", label: "Start today's practice", group: "Actions", icon: Dumbbell, run: () => (window.location.href = "/practice") },
      { id: "mentor", label: "Open AI mentor", group: "Navigate", icon: MessageSquareCode, run: () => (window.location.href = "/ai-mentor") },
      { id: "docs", label: "Search documentation", group: "Navigate", icon: FileText, run: () => (window.location.href = "/documentation") },
      { id: "run", label: "Run current challenge", group: "Actions", icon: Play, run: () => {} },
      { id: "project", label: "Open project", group: "Navigate", icon: FolderGit2, run: () => (window.location.href = "/projects") },
      { id: "review", label: "Review weak areas", group: "Actions", icon: AlertTriangle, run: () => (window.location.href = "/reviews") },
    ],
    []
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const commands = useCommands();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) return null;

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );
  const groups = ["Navigate", "Actions"] as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-void/70 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-md border border-hairline bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-hairline px-4 py-3">
          <Search className="h-4 w-4 text-text-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, projects, documentation…"
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-faint focus:outline-none"
          />
          <kbd className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-text-faint">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {groups.map((group) => {
            const items = filtered.filter((c) => c.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="px-2 py-1">
                <p className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-text-faint">
                  {group}
                </p>
                {items.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      c.run();
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded px-2.5 py-2 text-left text-sm text-text-muted hover:bg-elevated hover:text-text"
                    )}
                  >
                    <c.icon className="h-4 w-4 shrink-0" />
                    {c.label}
                  </button>
                ))}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-text-faint">
              No matches for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
