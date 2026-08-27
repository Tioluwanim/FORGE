"use client";

import { Search, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-hairline bg-void/80 px-6 backdrop-blur-sm">
      <button
        onClick={() =>
          window.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", metaKey: true })
          )
        }
        className="flex w-72 items-center gap-2 rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm text-text-faint hover:border-text-faint"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-text-muted">
          <Flame className="h-4 w-4 text-ember" />
          <span className="font-mono">12</span>
        </div>
        <Badge tone="ember">Level 4 · System Builder</Badge>
        <div className="h-8 w-8 rounded-full border border-hairline bg-elevated" />
      </div>
    </header>
  );
}
