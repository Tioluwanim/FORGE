"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const NODES = [
  { id: "you", label: "YOU", x: 300, y: 40 },
  { id: "python", label: "Python", x: 120, y: 130 },
  { id: "javascript", label: "JavaScript", x: 300, y: 130 },
  { id: "java", label: "Java", x: 480, y: 130 },
  { id: "http", label: "HTTP", x: 300, y: 220 },
  { id: "api", label: "API", x: 180, y: 300 },
  { id: "database", label: "Database", x: 300, y: 300 },
  { id: "cache", label: "Cache", x: 420, y: 300 },
  { id: "queue", label: "Queue", x: 180, y: 380 },
  { id: "worker", label: "Worker", x: 300, y: 380 },
  { id: "docker", label: "Docker", x: 420, y: 380 },
];

const LINKS: [string, string][] = [
  ["you", "python"],
  ["you", "javascript"],
  ["you", "java"],
  ["python", "http"],
  ["javascript", "http"],
  ["java", "http"],
  ["http", "api"],
  ["http", "database"],
  ["http", "cache"],
  ["api", "queue"],
  ["api", "worker"],
  ["cache", "docker"],
];

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export function ArchitectureDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const ctx = gsap.context(() => {
      const paths = gsap.utils.toArray<SVGPathElement>(".diagram-link");
      const nodes = gsap.utils.toArray<SVGGElement>(".diagram-node");

      paths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });
      gsap.set(nodes, { opacity: 0, scale: 0.85, transformOrigin: "center" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: svg,
          start: "top 75%",
          end: "bottom 60%",
          scrub: 0.6,
        },
      });

      tl.to(nodes[0], { opacity: 1, scale: 1, duration: 0.5 })
        .to(nodes.slice(1, 4), { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 }, "-=0.2")
        .to(paths.slice(0, 3), { strokeDashoffset: 0, duration: 0.5, stagger: 0.08 }, "<")
        .to(nodes.slice(4, 8), { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08 }, "-=0.1")
        .to(paths.slice(3, 9), { strokeDashoffset: 0, duration: 0.5, stagger: 0.06 }, "<")
        .to(nodes.slice(8), { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08 }, "-=0.1")
        .to(paths.slice(9), { strokeDashoffset: 0, duration: 0.5, stagger: 0.06 }, "<");
    }, svg);

    return () => ctx.revert();
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 600 430" className="mx-auto w-full max-w-2xl">
      {LINKS.map(([fromId, toId], i) => {
        const from = nodeById(fromId);
        const to = nodeById(toId);
        return (
          <path
            key={i}
            className="diagram-link"
            d={`M ${from.x} ${from.y + 14} L ${to.x} ${to.y - 14}`}
            stroke="#FF6A39"
            strokeOpacity={0.5}
            strokeWidth={1.5}
            fill="none"
          />
        );
      })}
      {NODES.map((n) => (
        <g key={n.id} className="diagram-node" transform={`translate(${n.x}, ${n.y})`}>
          <rect x={-46} y={-14} width={92} height={28} rx={5} fill="#131316" stroke="#26262B" />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontFamily="var(--font-mono)"
            fill="#F2F1EC"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
