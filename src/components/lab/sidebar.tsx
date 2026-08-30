"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Map,
  BookOpen,
  Dumbbell,
  FolderGit2,
  Bug,
  Server,
  Activity,
  Gauge,
  History,
  MessageSquareCode,
  Settings,
  ChevronsLeft,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/tooltip";

interface NavLeaf {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface NavGroup {
  label: string;
  children: NavLeaf[];
}

type NavItem = NavLeaf | NavGroup;

function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

// Information architecture per the FORGE nav spec — HOME / LEARN / BUILD /
// ENGINEER / PROGRESS / SYSTEM. Every href below resolves to a real route;
// no destination appears in more than one place (e.g. Projects lives only
// under BUILD — it used to appear three times).
const NAV: NavItem[] = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  {
    label: "Learn",
    children: [
      { label: "Roadmap", icon: Map, href: "/roadmap" },
      { label: "Learn", icon: BookOpen, href: "/learn" },
      { label: "Practice", icon: Dumbbell, href: "/practice" },
    ],
  },
  {
    label: "Build",
    children: [
      { label: "Projects", icon: FolderGit2, href: "/projects" },
      { label: "System Design", icon: Server, href: "/system-design" },
      { label: "Production", icon: Activity, href: "/production" },
    ],
  },
  {
    label: "Engineer",
    children: [
      { label: "Debug", icon: Bug, href: "/debug" },
      { label: "AI Mentor", icon: MessageSquareCode, href: "/ai-mentor" },
    ],
  },
  {
    label: "Progress",
    children: [
      { label: "Mastery", icon: Gauge, href: "/progress" },
      { label: "Reviews", icon: History, href: "/reviews" },
    ],
  },
];

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const activeHref = pathname ?? "/dashboard";
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Learn: true,
    Build: false,
    Engineer: false,
    Progress: false,
  });

  function isActive(href: string) {
    return activeHref === href || activeHref.startsWith(href + "/");
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-void/70 sm:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-hairline bg-surface transition-transform duration-200 sm:static sm:z-auto sm:translate-x-0 sm:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "sm:w-16" : "sm:w-60",
          "w-64"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-hairline px-4">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="font-display text-sm font-semibold tracking-[0.2em] text-text"
            >
              FORGE
            </Link>
          )}
          <button
            onClick={onMobileClose}
            aria-label="Close menu"
            className="rounded p-1.5 text-text-muted hover:bg-elevated hover:text-text sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden rounded p-1.5 text-text-muted hover:bg-elevated hover:text-text sm:block"
          >
            <ChevronsLeft
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            />
          </button>
        </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Primary">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) =>
            isGroup(item) ? (
              <li key={item.label}>
                <button
                  onClick={() =>
                    setOpenGroups((g) => ({ ...g, [item.label]: !g[item.label] }))
                  }
                  aria-expanded={collapsed ? undefined : openGroups[item.label]}
                  className="flex w-full items-center gap-3 rounded px-2.5 py-2 text-[11px] font-mono uppercase tracking-widest text-text-faint hover:text-text-muted"
                  title={collapsed ? item.label : undefined}
                >
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform",
                          openGroups[item.label] && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>
                {(collapsed || openGroups[item.label]) && (
                  <ul
                    className={cn(
                      "flex flex-col gap-0.5",
                      !collapsed && "ml-4 border-l border-hairline pl-3 py-1"
                    )}
                  >
                    {item.children.map((child) => {
                      const active = isActive(child.href);
                      const link = (
                        <Link
                          href={child.href}
                          aria-current={active ? "page" : undefined}
                          onClick={onMobileClose}
                          className={cn(
                            "flex items-center gap-2.5 rounded px-2.5 py-1.5 text-sm",
                            active
                              ? "text-text"
                              : "text-text-muted hover:bg-elevated hover:text-text"
                          )}
                        >
                          <child.icon className="h-3.5 w-3.5 shrink-0" />
                          {!collapsed && child.label}
                        </Link>
                      );
                      return (
                        <li key={child.href} className="relative">
                          {active && (
                            <span className="forge-seam absolute -left-3 top-0 h-full w-[2px]" />
                          )}
                          {collapsed ? <Tooltip label={child.label} className="w-full">{link}</Tooltip> : link}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.href} className="relative">
                {isActive(item.href) && (
                  <span className="forge-seam absolute left-0 top-0 h-full w-[2px] rounded-full" />
                )}
                {(() => {
                  const link = (
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-3 rounded px-2.5 py-2 text-sm",
                        isActive(item.href)
                          ? "bg-elevated text-text"
                          : "text-text-muted hover:bg-elevated hover:text-text"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && item.label}
                    </Link>
                  );
                  return collapsed ? <Tooltip label={item.label} className="w-full">{link}</Tooltip> : link;
                })()}
              </li>
            )
          )}
        </ul>
      </nav>

      <div className="border-t border-hairline p-2">
        {(() => {
          const settingsLink = (
            <Link
              href="/settings"
              aria-current={isActive("/settings") ? "page" : undefined}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded px-2.5 py-2 text-sm text-text-muted hover:bg-elevated hover:text-text",
                isActive("/settings") && "bg-elevated text-text"
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed && "Settings"}
            </Link>
          );
          return collapsed ? <Tooltip label="Settings" className="w-full">{settingsLink}</Tooltip> : settingsLink;
        })()}
      </div>
    </aside>
    </>
  );
}
