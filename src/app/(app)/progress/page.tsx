import { MasteryRing } from "@/components/ui/mastery-ring";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { TRACKS } from "@/lib/mock-data";

const BREAKDOWN = [
  { concept: "Concurrency", understanding: 81, implementation: 72, debugging: 54, recall: 64 },
  { concept: "FastAPI Dependency Injection", understanding: 88, implementation: 70, debugging: 61, recall: 75 },
  { concept: "PostgreSQL Transactions", understanding: 60, implementation: 45, debugging: 30, recall: 48 },
];

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-ember">Progress</p>
        <h1 className="mt-1 font-display text-2xl font-medium text-text">Mastery</h1>
      </Reveal>

      <Reveal delay={0.1} className="mt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {TRACKS.map((t) => (
            <Card key={t.language}>
              <CardContent className="flex items-center gap-4 py-5">
                <MasteryRing value={t.pct} size={56} strokeWidth={5} />
                <div>
                  <p className="font-display text-base text-text">{t.label}</p>
                  <p className="mt-0.5 text-xs text-text-faint">
                    {t.status === "not_started" ? "Not started" : "In progress"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>

      <div className="mt-8 space-y-4">
        {BREAKDOWN.map((c, i) => {
          const overall = Math.round(
            (c.understanding + c.implementation + c.debugging + c.recall) / 4
          );
          return (
            <Reveal key={c.concept} delay={0.15 + i * 0.05}>
              <Card>
                <CardHeader>
                  <CardTitle>{c.concept}</CardTitle>
                  <span className="font-mono text-sm text-text">{overall}%</span>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                  {(
                    [
                      ["Understanding", c.understanding],
                      ["Implementation", c.implementation],
                      ["Debugging", c.debugging],
                      ["Recall", c.recall],
                    ] as [string, number][]
                  ).map(([label, value]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">{label}</span>
                        <span className="font-mono text-text-faint">{value}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevated">
                        <div
                          className="h-full rounded-full bg-ember transition-[width] duration-700 ease-out"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
