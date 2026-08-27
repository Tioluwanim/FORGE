"use client";

import {
  Server,
  Database,
  Layers,
  ListOrdered,
  Cog,
  HardDrive,
  Globe,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type ArchitectureNodeType =
  | "api"
  | "load_balancer"
  | "database"
  | "cache"
  | "queue"
  | "worker"
  | "object_storage"
  | "cdn"
  | "auth_service";

const NODE_CONFIG: Record<ArchitectureNodeType, { icon: LucideIcon; label: string }> = {
  api: { icon: Server, label: "API Server" },
  load_balancer: { icon: Layers, label: "Load Balancer" },
  database: { icon: Database, label: "Database" },
  cache: { icon: HardDrive, label: "Cache" },
  queue: { icon: ListOrdered, label: "Queue" },
  worker: { icon: Cog, label: "Worker" },
  object_storage: { icon: HardDrive, label: "Object Storage" },
  cdn: { icon: Globe, label: "CDN" },
  auth_service: { icon: ShieldCheck, label: "Auth Service" },
};

interface ArchitectureCanvasNodeProps {
  type: ArchitectureNodeType;
  customLabel?: string;
  selected?: boolean;
  invalid?: boolean;
  onClick?: () => void;
}

export function ArchitectureCanvasNode({
  type,
  customLabel,
  selected,
  invalid,
  onClick,
}: ArchitectureCanvasNodeProps) {
  const { icon: Icon, label } = NODE_CONFIG[type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-36 flex-col items-center gap-2 rounded-md border bg-elevated px-3 py-4 transition-colors",
        selected ? "border-ember" : "border-hairline hover:border-text-faint",
        invalid && "border-signal-fail"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-sm border",
          invalid ? "border-signal-fail/50" : "border-hairline"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            invalid ? "text-signal-fail" : "text-text-muted"
          )}
        />
      </span>
      <span className="text-center text-xs font-medium text-text">
        {customLabel ?? label}
      </span>
    </button>
  );
}
