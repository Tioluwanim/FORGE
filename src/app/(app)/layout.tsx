import { Sidebar } from "@/components/lab/sidebar";
import { CommandPalette } from "@/components/lab/command-palette";
import { Topbar } from "@/components/lab/topbar";
import { CinematicShell } from "@/components/motion/cinematic-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <CommandPalette />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <CinematicShell>{children}</CinematicShell>
        </main>
      </div>
    </div>
  );
}
