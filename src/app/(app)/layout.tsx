import { Sidebar } from "@/components/lab/sidebar";
import { CommandPalette } from "@/components/lab/command-palette";
import { Topbar } from "@/components/lab/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <CommandPalette />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
