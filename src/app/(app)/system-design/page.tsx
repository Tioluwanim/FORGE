"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Server,
  Layers,
  Database,
  HardDrive,
  ListOrdered,
  Cog,
  Globe,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/toast";
import { systemDesignApi, type SystemDesignNode, type ValidationIssue } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";

interface PaletteItem {
  type: string;
  icon: LucideIcon;
  label: string;
}

const PALETTE: PaletteItem[] = [
  { type: "api", icon: Server, label: "API Server" },
  { type: "load_balancer", icon: Layers, label: "Load Balancer" },
  { type: "database", icon: Database, label: "Database" },
  { type: "cache", icon: HardDrive, label: "Cache" },
  { type: "queue", icon: ListOrdered, label: "Queue" },
  { type: "worker", icon: Cog, label: "Worker" },
  { type: "cdn", icon: Globe, label: "CDN" },
  { type: "auth", icon: ShieldCheck, label: "Auth Service" },
];

export default function SystemDesignPage() {
  const { loading: authLoading } = useAuth();
  const toast = useToast();
  const [placed, setPlaced] = useState<SystemDesignNode[]>([
    { id: "n1", type: "load_balancer", x: 80, y: 60 },
    { id: "n2", type: "api", x: 260, y: 60 },
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [checking, setChecking] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (authLoading) return;
    systemDesignApi
      .latest()
      .then((attempt) => {
        if (attempt && attempt.nodes.length > 0) {
          setPlaced(attempt.nodes);
          setIssues(attempt.issues);
        }
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true));
  }, [authLoading]);

  function addNode(type: string) {
    const id = `n${Date.now()}`;
    setPlaced((p) => [...p, { id, type, x: 100 + p.length * 30, y: 180 }]);
  }

  function duplicateSelected() {
    if (!selected) return;
    const src = placed.find((n) => n.id === selected);
    if (!src) return;
    const id = `n${Date.now()}`;
    const updated = [...placed, { ...src, id, x: src.x + 24, y: src.y + 24 }];
    setPlaced(updated);
    setSelected(id);
    checkArchitecture(updated);
  }

  function nudgeSelected(dx: number, dy: number) {
    if (!selected) return;
    const updated = placed.map((n) => (n.id === selected ? { ...n, x: n.x + dx, y: n.y + dy } : n));
    setPlaced(updated);
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => checkArchitecture(updated), 500);
  }

  function deleteSelected() {
    if (!selected) return;
    const updated = placed.filter((n) => n.id !== selected);
    setPlaced(updated);
    setSelected(null);
    checkArchitecture(updated);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (!selected) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        nudgeSelected(e.shiftKey ? -20 : -4, 0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nudgeSelected(e.shiftKey ? 20 : 4, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        nudgeSelected(0, e.shiftKey ? -20 : -4);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        nudgeSelected(0, e.shiftKey ? 20 : 4);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, placed]);

  // Commit position after a burst of arrow-key nudges settles, instead of
  // re-validating on every single keypress.

  async function checkArchitecture(nodes: SystemDesignNode[]) {
    setChecking(true);
    try {
      const result = await systemDesignApi.save(nodes);
      setIssues(result.issues);
    } catch {
      toast("Couldn't validate your design — try again.", "error");
    } finally {
      setChecking(false);
    }
  }

  if (!loaded || authLoading) return null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row">
      <div className="flex-1">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">
            System Design Lab
          </p>
          <h1 className="mt-1 font-display text-2xl font-medium text-text">
            Design a rate-limited API
          </h1>
          {loadError && (
            <p className="mt-2 text-xs text-signal-warn">
              Couldn&rsquo;t load your saved attempt — starting from a blank layout instead.
            </p>
          )}
        </Reveal>

        <Reveal delay={0.1} className="mt-6">
          <div className="relative h-[420px] overflow-hidden rounded-md border border-hairline bg-surface" onClick={() => setSelected(null)}>
            <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
            {placed.map((node) => {
              const item = PALETTE.find((p) => p.type === node.type)!;
              return (
                <motion.div
                  key={node.id}
                  drag
                  dragMomentum={false}
                  dragElastic={0.1}
                  initial={{ x: node.x, y: node.y, opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileDrag={{ scale: 1.05, zIndex: 10 }}
                  onDragEnd={(_, info) => {
                    const updated = placed.map((n) =>
                      n.id === node.id
                        ? { ...n, x: n.x + info.offset.x, y: n.y + info.offset.y }
                        : n
                    );
                    setPlaced(updated);
                    checkArchitecture(updated);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(node.id);
                  }}
                  className="absolute flex w-28 cursor-grab flex-col items-center gap-1.5 rounded-md border bg-elevated px-2 py-3 active:cursor-grabbing"
                  style={{
                    borderColor: selected === node.id ? "#FF6A39" : "#26262B",
                  }}
                >
                  <item.icon className="h-4 w-4 text-text-muted" />
                  <span className="text-center text-[11px] text-text">{item.label}</span>
                </motion.div>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-text-faint">
            {checking ? "Checking architecture…" : "Drag a node to re-validate."}
          </p>
          <Button variant="secondary" size="sm" onClick={() => checkArchitecture(placed)} disabled={checking}>
            Validate now
          </Button>
        </div>

        {issues.map((issue, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-3 rounded-md border px-4 py-3 text-sm text-text",
              issue.severity === "warn"
                ? "border-signal-warn/30 bg-signal-warn/[0.06]"
                : "border-signal-info/30 bg-signal-info/[0.06]"
            )}
          >
            <p>{issue.message}</p>
            {issue.severity === "warn" && (
              <a
                href={`/ai-mentor?prefill=${encodeURIComponent(
                  `I'm designing a rate-limited API and got this warning: "${issue.message}" — can you help me understand the trade-off?`
                )}`}
                className="mt-1.5 inline-block text-xs text-ember hover:underline"
              >
                Ask mentor →
              </a>
            )}
          </motion.div>
        ))}
      </div>

      <div className="w-full sm:w-56 sm:shrink-0">
        {selected && (
          <div className="mb-5 rounded-md border border-ember/30 bg-ember/[0.04] p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
              Selected
            </p>
            <p className="mt-1 text-sm text-text">
              {PALETTE.find((p) => p.type === placed.find((n) => n.id === selected)?.type)?.label}
            </p>
            <p className="mt-1.5 text-[11px] text-text-faint">
              Arrow keys to move · ⌘D to duplicate · Delete to remove
            </p>
            <div className="mt-2.5 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 justify-center" onClick={duplicateSelected}>
                Duplicate
              </Button>
              <Button variant="danger" size="sm" className="flex-1 justify-center" onClick={deleteSelected}>
                Delete
              </Button>
            </div>
          </div>
        )}
        <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
          Components
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-2">
          {PALETTE.map((item) => (
            <button
              key={item.type}
              onClick={() => addNode(item.type)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-md border border-hairline bg-surface px-2 py-3 text-center hover:border-text-faint"
              )}
            >
              <item.icon className="h-4 w-4 text-text-muted" />
              <span className="text-[10px] text-text-muted">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
