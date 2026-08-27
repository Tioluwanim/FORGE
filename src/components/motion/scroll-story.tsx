"use client";

import { useEffect, useRef } from "react";
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

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".story-word");
      gsap.set(words, { opacity: 0.12, scale: 0.9 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: `+=${words.length * 400}`,
          scrub: 0.5,
          pin: true,
        },
      });

      words.forEach((word, i) => {
        tl.to(word, { opacity: 1, scale: 1, duration: 0.3 })
          .to(word, { opacity: 0.12, scale: 0.9, duration: 0.3 }, i < words.length - 1 ? "+=0.4" : "+=0");
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
    </div>
  );
}
