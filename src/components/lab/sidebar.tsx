"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Map,
  BookOpen,
  Dumbbell,
  FolderGit2,
  Code2,
  Bug,
  Hammer,
  Server,
  Gauge,
  History,
  FlaskConical,
  Activity,
  MessageSquareCode,
  FileText,
  Settings,
  ChevronsLeft,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface NavLeaf {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavLeaf[];
}

type NavItem = NavLeaf | NavGroup;

function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

const NAV: NavItem[] = [
  { label: "Home", icon: Home, href: "/dashboard" },
  {
    label: "Learn",
    icon: BookOpen,
    children: [
      { label: "Roadmap", icon: Map, href: "/roadmap" },
      { label: "Concepts", icon: FlaskConical, href: "/learn" },
      { label: "Practice", icon: Dumbbell, href: "/practice" },
      { label: "Projects", icon: FolderGit2, href: "/projects" },
    ],
  },
  {
    label: "Lab",
    icon: Hammer,
    children: [
      { label: "Code", icon: Code2, href: "/challenge" },
      { label: "Debug", icon: Bug, href: "/debug" },
      { label: "Build", icon: Hammer, href: "/projects" },
      { label: "Systems", icon: Server, href: "/system-design" },
    ],
  },
  {
    label: "Progress",
    icon: Gauge,
    children: [
      { label: "Mastery", icon: Gauge, href: "/progress" },
      { label: "Reviews", icon: History, href: "/reviews" },
      { label: "History", icon: History, href: "/progress/history" },
    ],
  },
  { label: "Projects", icon: FolderGit2, href: "/projects" },
  { label: "Production", icon: Activity, href: "/production" },
  { label: "AI Mentor", icon: MessageSquareCode, href: "/ai-mentor" },
  { label: "Documentation", icon: FileText, href: "/documentation" },
];

export function Sidebar() {
  const pathname = usePathname();
  const activeHref = pathname ?? "/dashboard";
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Learn: true,
    Lab: false,
    Progress: false,
  });

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-hairline bg-surface transition-[width] duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-hairline px-4">
        {!collapsed && (
          <span className="font-display text-sm font-semibold tracking-[0.2em] text-text">
            FORGE
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded p-1.5 text-text-muted hover:bg-elevated hover:text-text"
        >
          <ChevronsLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <li key={item.label}>
              {isGroup(item) ? (
                <div>
                  <button
                    onClick={() =>
                      setOpenGroups((g) => ({ ...g, [item.label]: !g[item.label] }))
                    }
                    className="flex w-full items-center gap-3 rounded px-2.5 py-2 text-sm text-text-muted hover:bg-elevated hover:text-text"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            openGroups[item.label] && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && openGroups[item.label] && (
                    <ul className="ml-4 flex flex-col gap-0.5 border-l border-hairline pl-3 py-1">
                      {item.children.map((child) => {
                        const active =
                          activeHref === child.href || activeHref.startsWith(child.href + "/");
                        return (
                          <li key={child.label} className="relative">
                            {active && (
                              <span className="forge-seam absolute -left-3 top-0 h-full w-[2px]" />
                            )}
                            <a
                              href={child.href}
                              className={cn(
                                "flex items-center gap-2.5 rounded px-2.5 py-1.5 text-sm",
                                active
                                  ? "text-text"
                                  : "text-text-muted hover:bg-elevated hover:text-text"
                              )}
                            >
                              <child.icon className="h-3.5 w-3.5 shrink-0" />
                              {child.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : (
                (() => {
                  const active =
                    activeHref === item.href || activeHref.startsWith(item.href + "/");
                  return (
                    <div className="relative">
                      {active && (
                        <span className="forge-seam absolute left-0 top-0 h-full w-[2px] rounded-full" />
                      )}
                      <a
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded px-2.5 py-2 text-sm",
                          active
                            ? "bg-elevated text-text"
                            : "text-text-muted hover:bg-elevated hover:text-text"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && item.label}
                      </a>
                    </div>
                  );
                })()
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-hairline p-2">
        <a
          href="/settings"
          className="flex items-center gap-3 rounded px-2.5 py-2 text-sm text-text-muted hover:bg-elevated hover:text-text"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && "Settings"}
        </a>
      </div>
    </aside>
  );
}
