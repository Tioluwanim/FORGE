"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const WORDS = ["WATCH", "READ", "THINK", "CODE", "FAIL", "DEBUG", "BUILD", "MASTER"];

const WORD_COLOR: Record<string, string> = {
  WATCH: "text-text-faint",
  FAIL: "text-signal-fail",
  MASTER: "text-ember",
};

// Idle state — words that aren't the current focus sit here: visible enough
// to read as a trail behind/ahead of the active word, never fully gone.
const IDLE = { opacity: 0.16, scale: 0.9, filter: "blur(3px)", y: 0 };
const PEAK = { opacity: 1, scale: 1, filter: "blur(0px)", y: 0 };

const IN_DURATION = 0.4;
const HOLD_DURATION = 0.3;
const OUT_DURATION = 0.55;
// How much of word[i]'s fade-out overlaps word[i+1]'s fade-in — this is the
// actual fix: previously each word fully finished its exit before the next
// began, so there was a dead beat between words. Now they genuinely crossfade.
const OVERLAP = 0.32;

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".story-word");
      gsap.set(words, IDLE);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: `+=${words.length * 420}`,
          scrub: 0.6,
          pin: true,
          onUpdate: (self) => {
            setActiveIndex(Math.min(words.length - 1, Math.round(self.progress * (words.length - 1))));
          },
        },
      });

      let inStart = 0;
      words.forEach((word, i) => {
        const isLast = i === words.length - 1;

        // Rise from idle to peak.
        tl.to(word, { ...PEAK, duration: IN_DURATION, ease: "power2.out" }, inStart);

        if (!isLast) {
          const outStart = inStart + IN_DURATION + HOLD_DURATION;
          // Settle back to a faint trailing ghost (drifting slightly up)
          // rather than vanishing — this is what stays "still appear
          // faintly" while the next word rises through it.
          tl.to(
            word,
            { ...IDLE, y: -10, duration: OUT_DURATION, ease: "power2.inOut" },
            outStart
          );
          inStart = outStart + OUT_DURATION - OVERLAP;
        } else {
          // MASTER is the destination word — let it hold at full presence
          // instead of fading away, so the section ends on the payoff.
          tl.to(word, { opacity: 1, duration: 0.2 }, inStart + IN_DURATION + HOLD_DURATION);
        }
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative flex h-screen items-center justify-center overflow-hidden">
      <div className="relative flex h-24 items-center justify-center">
        {WORDS.map((word) => (
          <span
            key={word}
            className={`story-word absolute font-display text-5xl font-medium tracking-wide md:text-7xl ${
              WORD_COLOR[word] ?? "text-text"
            }`}
          >
            {word}
          </span>
        ))}
      </div>

      <div className="absolute bottom-10 flex items-center gap-2">
        {WORDS.map((word, i) => (
          <span
            key={word}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-5 bg-ember" : "w-1.5 bg-text-faint/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
