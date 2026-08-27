"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { label: "General", href: "/settings" },
  { label: "Profile", href: "/settings/profile" },
  { label: "Preferences", href: "/settings/preferences" },
  { label: "Security", href: "/settings/security" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Settings</p>
      <div className="mt-3 flex gap-1 border-b border-hairline">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative px-3 py-2.5 text-sm",
              pathname === tab.href ? "text-text" : "text-text-muted hover:text-text"
            )}
          >
            {tab.label}
            {pathname === tab.href && (
              <span className="forge-seam absolute bottom-0 left-0 h-[2px] w-full" />
            )}
          </Link>
        ))}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
