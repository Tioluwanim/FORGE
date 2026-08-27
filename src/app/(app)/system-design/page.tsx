"use client";

import { useRef, useState } from "react";
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
import { cn } from "@/lib/cn";

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

interface PlacedNode {
  id: string;
  type: string;
  x: number;
  y: number;
}

export default function SystemDesignPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<PlacedNode[]>([
    { id: "n1", type: "load_balancer", x: 80, y: 60 },
    { id: "n2", type: "api", x: 260, y: 60 },
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const nextNodeId = useRef(3);

  function addNode(type: string) {
    const id = `n${nextNodeId.current++}`;
    setPlaced((p) => [...p, { id, type, x: 100 + p.length * 30, y: 180 }]);
  }

  function checkArchitecture(nodes: PlacedNode[]) {
    const worker = nodes.find((n) => n.type === "worker");
    const lb = nodes.find((n) => n.type === "load_balancer");
    if (worker && lb && Math.abs(worker.y - lb.y) < 40 && worker.x > lb.x) {
      setNote("You've placed the worker directly behind the load balancer. Is that what you intended? Workers usually consume from a queue, not from client traffic.");
    } else {
      setNote(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
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
          <div ref={canvasRef} className="relative h-[min(420px,65vh)] min-h-[320px] overflow-hidden rounded-md border border-hairline bg-surface">
            <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
            {placed.map((node) => {
              const item = PALETTE.find((p) => p.type === node.type)!;
              return (
                <motion.div
                  key={node.id}
                  drag
                  dragMomentum={false}
                  dragElastic={0.1}
                  dragConstraints={canvasRef}
                  initial={{ x: node.x, y: node.y, opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileDrag={{ scale: 1.05, zIndex: 10 }}
                  onDragEnd={(_, info) => {
                    const bounds = canvasRef.current?.getBoundingClientRect();
                    const maxX = Math.max(0, (bounds?.width ?? 500) - 112);
                    const maxY = Math.max(0, (bounds?.height ?? 420) - 72);
                    const updated = placed.map((n) =>
                      n.id === node.id
                        ? { ...n, x: Math.max(0, Math.min(maxX, n.x + info.offset.x)), y: Math.max(0, Math.min(maxY, n.y + info.offset.y)) }
                        : n
                    );
                    setPlaced(updated);
                    checkArchitecture(updated);
                  }}
                  onClick={() => setSelected(node.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${item.label}`}
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

        {note && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-md border border-signal-warn/30 bg-signal-warn/[0.06] px-4 py-3 text-sm text-text"
          >
            {note}
          </motion.div>
        )}
      </div>

      <div className="w-full shrink-0 lg:w-56">
        <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
          Components
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
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
