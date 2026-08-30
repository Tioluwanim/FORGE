"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { LineReveal } from "@/components/motion/text-reveal";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { TiltCard } from "@/components/motion/tilt-card";
import { GlowField, ParticleField, GridBackground, NoiseOverlay } from "@/components/motion/backgrounds";
import { ScrollStory } from "@/components/motion/scroll-story";
import { ArchitectureDiagram } from "@/components/motion/architecture-diagram";
import { InteractiveShowcase } from "@/components/marketing/interactive-showcase";
import { motionTokens } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

// R3F touches WebGL — dynamically imported, client-only, and mounted nowhere
// else in the app (spec §5, §41).
const HeroScene = dynamic(
  () => import("@/components/motion/hero-scene").then((m) => m.HeroScene),
  { ssr: false }
);

const LANGUAGE_TRACKS = [
  {
    name: "Python",
    focus: "Backend Engineering",
    blurb: "Build APIs, services, and production systems.",
    stack: ["FastAPI", "PostgreSQL", "Redis", "Docker"],
    accent: "border-signal-info/40",
    glow: "#60A5FA",
  },
  {
    name: "JavaScript",
    focus: "Full-Stack Engineering",
    blurb: "Ship services and the interfaces that call them.",
    stack: ["Node.js", "PostgreSQL", "Redis", "Docker"],
    accent: "border-signal-warn/40",
    glow: "#FBBF24",
  },
  {
    name: "Java",
    focus: "Enterprise Systems",
    blurb: "Build the systems large organizations run on.",
    stack: ["Spring Boot", "PostgreSQL", "Redis", "Docker"],
    accent: "border-signal-pass/40",
    glow: "#4ADE80",
  },
];

const SYSTEMS_ROW = ["API", "Database", "Cache", "Queue", "Worker", "Authentication", "Docker", "Observability"];

function Hero() {
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(useTransform(rawX, [-0.5, 0.5], [-14, 14]), motionTokens.spring.soft);
  const py = useSpring(useTransform(rawY, [-0.5, 0.5], [-10, 10]), motionTokens.spring.soft);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      onPointerMove={handlePointerMove}
      className="relative flex min-h-[94vh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-16 text-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,106,57,0.2),transparent_28%),radial-gradient(circle_at_50%_72%,rgba(255,106,57,0.08),transparent_42%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D10]/10 via-transparent to-[#0B0D10]" />
      <GridBackground />
      <GlowField />
      <ParticleField count={18} />
      <NoiseOverlay opacity={0.06} />
      {!reduceMotion && (
        <div className="absolute inset-0 opacity-80">
          <HeroScene />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0C0E] via-[#0A0C0E]/40 to-transparent" />

      <motion.div
        style={reduceMotion ? undefined : { x: px, y: py }}
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: motionTokens.durations.cinematic, ease: motionTokens.easing.cinematic }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.durations.cinematic, delay: 0.15, ease: motionTokens.easing.cinematic }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.38em] text-ember/90">
            The Engineering Lab
          </p>
        </motion.div>

        <p className="mt-6 max-w-5xl text-balance font-display text-[clamp(3rem,7vw,7rem)] font-medium leading-[0.88] tracking-[-0.06em] text-text drop-shadow-[0_0_28px_rgba(255,106,57,0.12)]">
          <LineReveal delay={0.35}>Stop watching tutorials.</LineReveal>{" "}
          <LineReveal delay={0.8}>Start building like an engineer.</LineReveal>
        </p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: motionTokens.easing.cinematic }}
        >
          <h1 className="mt-8 font-display text-4xl font-semibold tracking-[0.22em] text-text md:text-6xl">
            FORGE
          </h1>
          <p className="mt-4 max-w-xl text-sm text-text-muted md:text-base">
            Learn concepts, write code, debug real failures — for Python,
            JavaScript, and Java.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2, ease: motionTokens.easing.cinematic }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link href="/signup" data-cursor="ENTER">
            <MagneticButton className="rounded-full border border-ember/50 bg-ember/10 px-7 py-3.5 text-sm font-medium text-text shadow-[0_0_30px_rgba(255,106,57,0.18)] backdrop-blur-sm transition-all duration-300 hover:bg-ember/15">
              Enter the Lab
            </MagneticButton>
          </Link>
          <a
            href="#try-it"
            data-cursor="TRY IT"
            className="flex items-center gap-2 rounded-full border border-hairline bg-surface/30 px-6 py-3.5 text-sm text-text-muted backdrop-blur-sm transition-all duration-300 hover:border-text-faint hover:bg-surface/60 hover:text-text"
          >
            Try it — no signup
            <ArrowDown className="h-3.5 w-3.5" />
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#try-it"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 3.5, ease: motionTokens.easing.cinematic }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-text-faint hover:text-text-muted"
        aria-label="Scroll to interactive demo"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </motion.a>
    </section>
  );
}

function ProductionTeaser() {
  const [stage, setStage] = useState<"idle" | "under-pressure" | "fixed">("idle");

  return (
    <div className="mt-10">
      <Stagger className="flex flex-wrap items-center justify-center gap-4 font-mono text-sm text-text-muted">
        {["10 users", "1,000 users", "100,000 users"].map((label, i, arr) => (
          <StaggerItem key={label} className="flex items-center gap-4">
            <>
              {label}
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-ember/60" />}
            </>
          </StaggerItem>
        ))}
        <StaggerItem>
          <span className={cn("flex items-center gap-4", stage !== "fixed" && "text-signal-fail")}>
            <ArrowRight className="h-3 w-3 text-ember/60" />
            {stage === "fixed" ? "Stable under load" : "System under pressure"}
          </span>
        </StaggerItem>
      </Stagger>

      <div className="mx-auto mt-8 max-w-md">
        {stage === "idle" && (
          <Reveal delay={0.2}>
            <p className="text-center text-sm text-text-faint">
              Latency climbs. Something breaks. What would you change?
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setStage("under-pressure")}
                className="rounded-md border border-hairline px-4 py-2 text-sm text-text-muted hover:border-ember hover:text-text"
              >
                Simulate the spike
              </button>
            </div>
          </Reveal>
        )}
        {stage === "under-pressure" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-center text-sm text-signal-fail">
              Database connections exhausted. Pick a fix:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setStage("fixed")}
                className="rounded-md border border-ember/40 bg-ember/[0.06] px-4 py-2 text-sm text-text hover:bg-ember/[0.1]"
              >
                Add a cache
              </button>
              <button
                onClick={() => setStage("fixed")}
                className="rounded-md border border-hairline px-4 py-2 text-sm text-text-muted hover:border-text-faint"
              >
                Just add a bigger database
              </button>
            </div>
          </motion.div>
        )}
        {stage === "fixed" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-signal-pass"
          >
            That&rsquo;s the kind of call you&rsquo;ll make in the real Production Lab — with real
            metrics and real trade-offs, not just this teaser.
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef}>
      <Hero />

      {/* Interactive showcase — the actual product, usable right here, no signup */}
      <section className="px-6 py-28">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-ember">
            Not a demo video. The actual thing.
          </p>
          <p className="mt-2 font-display text-2xl font-medium text-text md:text-3xl">
            Try it right now.
          </p>
        </Reveal>
        <div className="mt-10">
          <InteractiveShowcase />
        </div>
      </section>

      {/* Section 1 — The Problem */}
      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <Reveal>
          <p className="font-display text-3xl font-medium text-text md:text-4xl">
            You watched it.
            <br />
            You understood it.
            <br />
            <span className="text-text-muted">You still couldn&rsquo;t build it.</span>
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 text-sm text-text-faint">
            That palindrome bug above? That&rsquo;s the difference. Reading the fix and typing it yourself are two different skills.
          </p>
        </Reveal>
      </section>

      {/* Section 2 — Philosophy */}
      <section className="border-y border-hairline bg-surface/40 px-6 py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center">
          <Reveal>
            <p className="font-display text-2xl text-text md:text-3xl">
              Learning software engineering requires friction.
            </p>
          </Reveal>
          <Stagger className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs uppercase tracking-widest text-text-faint">
            {["Read", "Understand", "Implement", "Test", "Fail", "Debug", "Repeat"].map((word, i, arr) => (
              <StaggerItem key={word} className="flex items-center gap-3">
                <>
                  {word}
                  {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-ember/60" />}
                </>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Section 3 — pinned scroll story (WATCH → ... → MASTER) */}
      <ScrollStory />

      {/* Section 4 — The FORGE Architecture Visualization */}
      <section className="mx-auto max-w-3xl px-6 py-32">
        <Reveal>
          <p className="text-center font-mono text-xs uppercase tracking-widest text-ember">
            How it all connects
          </p>
        </Reveal>
        <div className="mt-10">
          <ArchitectureDiagram />
        </div>
      </section>

      {/* Section 5 — Choose Your Language */}
      <section className="border-y border-hairline px-6 py-32">
        <Reveal>
          <p className="text-center font-mono text-xs uppercase tracking-widest text-ember">
            Choose your language
          </p>
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
          {LANGUAGE_TRACKS.map((track, i) => (
            <Reveal key={track.name} delay={i * 0.1}>
              <Link href="/select-language" data-cursor="SELECT">
                <TiltCard
                  className={`group relative overflow-hidden rounded-md border bg-surface p-8 ${track.accent}`}
                >
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
                    style={{ background: track.glow }}
                  />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-text-faint">
                    {track.focus}
                  </p>
                  <p className="mt-2 font-display text-2xl text-text">{track.name}</p>
                  <p className="mt-2 text-sm text-text-muted">{track.blurb}</p>
                  <div className="mt-4 flex flex-col gap-1.5">
                    {track.stack.map((tech, ti) => (
                      <motion.p
                        key={tech}
                        initial={{ opacity: 0, x: -6 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + ti * 0.08, duration: 0.35 }}
                        className="font-mono text-xs text-text-faint"
                      >
                        → {tech}
                      </motion.p>
                    ))}
                  </div>
                  <p className="mt-5 flex items-center gap-1.5 text-sm text-ember">
                    Explore {track.name}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </p>
                </TiltCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Section 5.5 — From consumption to capability */}
      <section className="mx-auto max-w-3xl px-6 py-28">
        <Reveal>
          <p className="text-center font-mono text-xs uppercase tracking-widest text-ember">
            What FORGE actually builds
          </p>
        </Reveal>
        <div className="mt-10 space-y-6">
          {[
            { from: "\u201CI understand Redis.\u201D", to: "I built a Redis-backed rate limiter." },
            { from: "\u201CI know APIs.\u201D", to: "I debugged a failing production API." },
            { from: "\u201CI studied system design.\u201D", to: "I designed a scalable architecture." },
          ].map((row, i) => (
            <Reveal key={row.from} delay={i * 0.1}>
              <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-hairline bg-surface px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
                <p className="text-sm text-text-faint line-through decoration-text-faint/50">
                  {row.from}
                </p>
                <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-ember sm:rotate-0" />
                <p className="font-display text-base text-text">{row.to}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Section 6 — Build Real Systems */}
      <section className="mx-auto max-w-4xl px-6 py-32 text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">
            Build real systems
          </p>
        </Reveal>
        <Stagger className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {SYSTEMS_ROW.map((label) => (
            <StaggerItem key={label}>
              <div className="rounded-md border border-hairline bg-surface px-4 py-2.5 text-sm text-text">
                {label}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Section 7 — AI Mentor callback */}
      <section className="border-y border-hairline bg-surface/40 px-6 py-24 text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">AI Mentor</p>
          <p className="mt-3 max-w-xl mx-auto text-text-muted">
            You already talked to it. Notice it asked you a question back instead of
            handing you the fix — that&rsquo;s deliberate, on every hint, for every
            learner, every time.
          </p>
          <a
            href="#try-it"
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-ember hover:text-ember-glow"
          >
            Talk to it again <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </Reveal>
      </section>

      {/* Section 8 — Production */}
      <section className="mx-auto max-w-4xl px-6 py-32 text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">Production</p>
        </Reveal>
        <ProductionTeaser />
      </section>

      {/* Final CTA */}
      <section className="px-6 py-40 text-center">
        <Reveal>
          <p className="font-display text-4xl font-medium text-text md:text-5xl">
            Stop consuming tutorials.
          </p>
          <p className="mt-2 font-display text-4xl font-medium text-ember md:text-5xl">
            Start engineering.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href="/signup" data-cursor="ENTER">
              <MagneticButton className="px-8 py-3.5">Enter the Lab</MagneticButton>
            </Link>
            <a href="#try-it" className="text-xs text-text-faint hover:text-text-muted">
              Or scroll back up and try it again ↑
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
