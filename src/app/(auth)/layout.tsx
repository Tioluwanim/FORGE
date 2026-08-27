import Link from "next/link";
import { CinematicShell } from "@/components/motion/cinematic-shell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <CinematicShell>
      <div className="flex min-h-screen flex-col items-center justify-center bg-void/80 px-6 py-16">
        <Link
          href="/"
          className="mb-10 font-display text-sm font-semibold tracking-[0.25em] text-text"
        >
          FORGE
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </CinematicShell>
  );
}
