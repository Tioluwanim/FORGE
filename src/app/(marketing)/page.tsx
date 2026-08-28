"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { LineReveal } from "@/components/motion/text-reveal";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { TiltCard } from "@/components/motion/tilt-card";
import { GlowField, ParticleField, GridBackground } from "@/components/motion/backgrounds";
import { ScrollStory } from "@/components/motion/scroll-story";
import { ArchitectureDiagram } from "@/components/motion/architecture-diagram";
import { InteractiveShowcase } from "@/components/marketing/interactive-showcase";
import { motionTokens } from "@/lib/motion-tokens";

// R3F touches WebGL — dynamically imported, client-only, and mounted nowhere
// else in the app (spec §5, §41).
const HeroScene = dynamic(
  () => import("@/components/motion/hero-scene").then((m) => m.HeroScene),
  { ssr: false }
);

const LANGUAGE_TRACKS = [
  { name: "Python", stack: ["FastAPI", "PostgreSQL", "Redis", "Docker"], accent: "border-signal-info/40", glow: "#60A5FA" },
  { name: "JavaScript", stack: ["Node.js", "PostgreSQL", "Redis", "Docker"], accent: "border-signal-warn/40", glow: "#FBBF24" },
  { name: "Java", stack: ["Spring Boot", "PostgreSQL", "Redis", "Docker"], accent: "border-signal-pass/40", glow: "#4ADE80" },
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
      className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <GridBackground />
      <GlowField />
      <ParticleField count={20} />
      {!reduceMotion && (
        <div className="absolute inset-0">
          <HeroScene />
        </div>
      )}

      <motion.div
        style={reduceMotion ? undefined : { x: px, y: py }}
        className="relative flex flex-col items-center"
      >
        <p className="max-w-2xl font-display text-2xl font-medium text-text-muted md:text-3xl">
          <LineReveal delay={0.2}>You don&rsquo;t become an engineer by watching code.</LineReveal>
        </p>
        <p className="mt-3 max-w-2xl font-display text-3xl font-medium text-text md:text-4xl">
          <LineReveal delay={1.1}>You become one by building.</LineReveal>
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.9 }}
          className="mt-14 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-text-faint md:text-sm"
        >
          {["READ", "THINK", "CODE", "BREAK", "DEBUG", "BUILD"].map((step, i, arr) => (
            <span key={step} className="flex items-center gap-3">
              {step}
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-ember/60" />}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.durations.cinematic, delay: 2.3, ease: motionTokens.easing.cinematic }}
          className="mt-10"
        >
          <h1 className="font-display text-6xl font-semibold tracking-[0.15em] text-text md:text-8xl">
            FORGE
          </h1>
          <p className="mt-4 text-base text-text-muted">
            The interactive engineering lab for Python, JavaScript and Java developers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.7 }}
          className="mt-10 flex items-center gap-4"
        >
          <Link href="/signup" data-cursor="ENTER">
            <MagneticButton>Enter the Lab</MagneticButton>
          </Link>
          <a
            href="#try-it"
            data-cursor="TRY IT"
            className="flex items-center gap-2 rounded-md border border-hairline px-6 py-3 text-sm text-text-muted hover:border-text-faint hover:text-text"
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
        transition={{ duration: 0.6, delay: 3.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-faint hover:text-text-muted"
        aria-label="Scroll to interactive demo"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </motion.a>
    </section>
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
                  <p className="font-display text-2xl text-text">{track.name}</p>
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
                </TiltCard>
              </Link>
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
        <Stagger className="mt-10 flex flex-wrap items-center justify-center gap-4 font-mono text-sm text-text-muted">
          {["10 users", "1,000 users", "100,000 users"].map((label, i, arr) => (
            <StaggerItem key={label} className="flex items-center gap-4">
              <>
                {label}
                {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-ember/60" />}
              </>
            </StaggerItem>
          ))}
          <StaggerItem>
            <span className="flex items-center gap-4 text-signal-fail">
              <ArrowRight className="h-3 w-3 text-ember/60" /> System under pressure
            </span>
          </StaggerItem>
        </Stagger>
        <Reveal delay={0.3}>
          <p className="mt-6 text-sm text-text-faint">
            Latency climbs. Something breaks. You find out what — and fix it.
          </p>
        </Reveal>
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
