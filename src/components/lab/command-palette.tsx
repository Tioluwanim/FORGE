"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Map,
  BookOpen,
  Dumbbell,
  FolderGit2,
  Server,
  Activity,
  Bug,
  MessageSquareCode,
  Gauge,
  History,
  Settings,
  Search,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface Command {
  id: string;
  label: string;
  group: "Navigate" | "Actions";
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const COMMANDS: Command[] = [
  { id: "dashboard", label: "Dashboard", group: "Navigate", icon: Home, href: "/dashboard" },
  { id: "roadmap", label: "Roadmap", group: "Navigate", icon: Map, href: "/roadmap" },
  { id: "learn", label: "Learn", group: "Navigate", icon: BookOpen, href: "/learn" },
  { id: "practice", label: "Practice", group: "Navigate", icon: Dumbbell, href: "/practice" },
  { id: "projects", label: "Projects", group: "Navigate", icon: FolderGit2, href: "/projects" },
  { id: "system-design", label: "System Design", group: "Navigate", icon: Server, href: "/system-design" },
  { id: "production", label: "Production", group: "Navigate", icon: Activity, href: "/production" },
  { id: "debug", label: "Debug Lab", group: "Navigate", icon: Bug, href: "/debug" },
  { id: "mentor", label: "AI Mentor", group: "Navigate", icon: MessageSquareCode, href: "/ai-mentor" },
  { id: "mastery", label: "Mastery", group: "Navigate", icon: Gauge, href: "/progress" },
  { id: "reviews", label: "Reviews", group: "Navigate", icon: History, href: "/reviews" },
  { id: "settings", label: "Settings", group: "Navigate", icon: Settings, href: "/settings" },
  { id: "start-practice", label: "Start today's practice", group: "Actions", icon: Dumbbell, href: "/practice" },
  { id: "review-weak", label: "Review weak areas", group: "Actions", icon: History, href: "/reviews" },
  { id: "open-mentor", label: "Ask the mentor", group: "Actions", icon: MessageSquareCode, href: "/ai-mentor" },
];

const RECENTS_KEY = "forge:command-palette-recents";

// Lightweight subsequence-based fuzzy match — every character of the query
// must appear in the label in order, not necessarily contiguously.
function fuzzyMatch(label: string, query: string): boolean {
  if (!query) return true;
  const l = label.toLowerCase();
  let qi = 0;
  const q = query.toLowerCase();
  for (let i = 0; i < l.length && qi < q.length; i++) {
    if (l[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECENTS_KEY);
      if (stored) setRecents(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        triggerRef.current = document.activeElement as HTMLElement;
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Focus after the dialog mounts
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      // Return focus to whatever triggered the palette (accessibility: never strand focus)
      triggerRef.current?.focus();
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query) {
      const recentCommands = recents
        .map((id) => COMMANDS.find((c) => c.id === id))
        .filter((c): c is Command => !!c);
      return { recent: recentCommands, matched: COMMANDS };
    }
    return { recent: [], matched: COMMANDS.filter((c) => fuzzyMatch(c.label, query)) };
  }, [query, recents]);

  const flatList = query ? results.matched : [...results.recent, ...COMMANDS];
  // De-dupe when showing recents + full list together
  const seen = new Set<string>();
  const flatUnique = flatList.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));

  function runCommand(c: Command) {
    const nextRecents = [c.id, ...recents.filter((id) => id !== c.id)].slice(0, 4);
    setRecents(nextRecents);
    try {
      window.localStorage.setItem(RECENTS_KEY, JSON.stringify(nextRecents));
    } catch {
      // best-effort only
    }
    setOpen(false);
    router.push(c.href);
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatUnique.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = flatUnique[activeIndex];
      if (c) runCommand(c);
    }
  }

  if (!open) return null;

  const groups = query
    ? (["Navigate", "Actions"] as const)
    : (["Recent", "Navigate", "Actions"] as const);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-void/70 pt-[15vh]"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-md border border-hairline bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-hairline px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-text-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search pages and actions…"
            aria-label="Search commands"
            aria-controls="command-palette-list"
            aria-activedescendant={flatUnique[activeIndex] ? `cmd-${flatUnique[activeIndex].id}` : undefined}
            role="combobox"
            aria-expanded="true"
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-faint focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-text-faint">
            ESC
          </kbd>
        </div>
        <div id="command-palette-list" ref={listRef} role="listbox" className="max-h-80 overflow-y-auto py-2">
          {groups.map((group) => {
            const items =
              group === "Recent"
                ? results.recent
                : (query ? results.matched : COMMANDS).filter((c) => c.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="px-2 py-1">
                <p className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-text-faint">
                  {group === "Recent" && <Clock className="h-3 w-3" />}
                  {group}
                </p>
                {items.map((c) => {
                  const flatIdx = flatUnique.findIndex((f) => f.id === c.id);
                  const active = flatIdx === activeIndex;
                  return (
                    <button
                      key={`${group}-${c.id}`}
                      id={`cmd-${c.id}`}
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(flatIdx)}
                      onClick={() => runCommand(c)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded px-2.5 py-2 text-left text-sm",
                        active ? "bg-elevated text-text" : "text-text-muted hover:bg-elevated hover:text-text"
                      )}
                    >
                      <c.icon className="h-4 w-4 shrink-0" />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
          {query && results.matched.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-text-faint">
              No matches for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
