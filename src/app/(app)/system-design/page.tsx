"use client";

import { useEffect, useState } from "react";
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
  const [placed, setPlaced] = useState<SystemDesignNode[]>([
    { id: "n1", type: "load_balancer", x: 80, y: 60 },
    { id: "n2", type: "api", x: 260, y: 60 },
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [checking, setChecking] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
      .finally(() => setLoaded(true));
  }, [authLoading]);

  function addNode(type: string) {
    const id = `n${Date.now()}`;
    setPlaced((p) => [...p, { id, type, x: 100 + p.length * 30, y: 180 }]);
  }

  async function checkArchitecture(nodes: SystemDesignNode[]) {
    setChecking(true);
    try {
      const result = await systemDesignApi.save(nodes);
      setIssues(result.issues);
    } finally {
      setChecking(false);
    }
  }

  if (!loaded || authLoading) return null;

  return (
    <div className="mx-auto flex max-w-5xl gap-6">
      <div className="flex-1">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">
            System Design Lab
          </p>
          <h1 className="mt-1 font-display text-2xl font-medium text-text">
            Design a rate-limited API
          </h1>
        </Reveal>

        <Reveal delay={0.1} className="mt-6">
          <div className="relative h-[420px] overflow-hidden rounded-md border border-hairline bg-surface">
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
                  onClick={() => setSelected(node.id)}
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
            {issue.message}
          </motion.div>
        ))}
      </div>

      <div className="w-56 shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
          Components
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
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
