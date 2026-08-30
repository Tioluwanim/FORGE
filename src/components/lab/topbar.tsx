"use client";

import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/use-auth";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, primaryTrack } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-hairline bg-void/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="shrink-0 rounded p-1.5 text-text-muted hover:bg-elevated hover:text-text sm:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={() =>
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true })
            )
          }
          className="flex w-full max-w-xs items-center gap-2 rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm text-text-faint hover:border-text-faint sm:w-72"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden flex-1 text-left sm:inline">Search…</span>
          <kbd className="ml-auto hidden rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {primaryTrack && (
          <span className="hidden font-mono text-xs text-text-faint sm:inline">
            {primaryTrack.label}
          </span>
        )}
        {user && <Badge tone="ember">Level {user.engineering_level}</Badge>}
        <Link
          href="/settings"
          aria-label="Settings and account"
          className="h-8 w-8 rounded-full border border-hairline bg-elevated"
        />
      </div>
    </header>
  );
}
