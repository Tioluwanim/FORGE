"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { LineReveal } from "@/components/motion/text-reveal";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { TiltCard } from "@/components/motion/tilt-card";
import { GlowField, NoiseOverlay, ParticleField, GridBackground } from "@/components/motion/backgrounds";
import { ScrollStory } from "@/components/motion/scroll-story";
import { ArchitectureDiagram } from "@/components/motion/architecture-diagram";
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_24%,rgba(8,8,10,0.18)_58%,rgba(8,8,10,0.82)_100%)]" />
      <NoiseOverlay opacity={0.035} />
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
          <MagneticButton as="a" href="/signup" data-cursor="ENTER">Enter the Lab</MagneticButton>
          <Link
            href="/tracks"
            data-cursor="VIEW"
            className="rounded-md border border-hairline px-6 py-3 text-sm text-text-muted hover:border-text-faint hover:text-text"
          >
            Explore the Path
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef}>
      <Hero />

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
              <Link href={`/select-language?language=${track.name.toLowerCase()}`} data-cursor="SELECT">
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

      {/* Section 7 — AI Mentor */}
      <section className="border-y border-hairline bg-surface/40 px-6 py-32">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <p className="text-center font-mono text-xs uppercase tracking-widest text-ember">
              AI Mentor
            </p>
          </Reveal>
          <div className="mt-8 space-y-3">
            <Reveal delay={0.1}>
              <div className="ml-auto max-w-sm rounded-md rounded-tr-none bg-elevated px-4 py-2.5 text-sm text-text-muted">
                Tests failing — not sure why.
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="max-w-md rounded-md rounded-tl-none border border-ember/30 bg-ember/5 px-4 py-3 text-sm text-text">
                Look at the lifecycle of the dependency. What happens when the required value is missing?
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="ml-auto max-w-sm rounded-md rounded-tr-none bg-elevated px-4 py-2.5 text-sm text-text-muted">
                Still stuck.
              </div>
            </Reveal>
            <Reveal delay={0.55}>
              <div className="max-w-md rounded-md rounded-tl-none border border-ember/30 bg-ember/5 px-4 py-3 text-sm text-text">
                Check what your dependency returns when the header is missing entirely, versus when it&rsquo;s empty. Those are different cases.
              </div>
            </Reveal>
          </div>
        </div>
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
          <div className="mt-10 flex justify-center">
            <Link href="/signup" data-cursor="ENTER">
              <MagneticButton className="px-8 py-3.5">Enter the Lab</MagneticButton>
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
