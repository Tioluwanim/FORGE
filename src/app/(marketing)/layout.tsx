import Link from "next/link";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { CustomCursor } from "@/components/motion/cursor";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import { CinematicShell } from "@/components/motion/cinematic-shell";

const NAV_LINKS = [
  { label: "Method", href: "/method" },
  { label: "Tracks", href: "/tracks" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <ScrollProgress />
      <CustomCursor />
      <CinematicShell>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-hairline bg-void/80 px-8 backdrop-blur-sm">
          <Link
            href="/"
            data-cursor="HOME"
            className="font-display text-sm font-semibold tracking-[0.25em] text-text"
          >
            FORGE
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-cursor="VIEW"
                className="text-sm text-text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-text-muted hover:text-text"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              data-cursor="ENTER"
              className="rounded-md bg-ember px-4 py-2 text-sm font-medium text-void hover:bg-ember-glow"
            >
              Enter the Lab
            </Link>
          </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-hairline px-8 py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <span className="font-display text-sm tracking-[0.25em] text-text-faint">
              FORGE
            </span>
            <div className="flex gap-6 text-sm text-text-faint">
              <Link href="/method" className="hover:text-text-muted">
                Method
              </Link>
              <Link href="/tracks" className="hover:text-text-muted">
                Tracks
              </Link>
              <Link href="/pricing" className="hover:text-text-muted">
                Pricing
              </Link>
              <Link href="/about" className="hover:text-text-muted">
                About
              </Link>
            </div>
            <span className="text-sm text-text-faint">
              &copy; {new Date().getFullYear()} FORGE
            </span>
          </div>
          </footer>
        </div>
      </CinematicShell>
    </SmoothScrollProvider>
  );
}
