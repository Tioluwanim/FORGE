import { BookOpen, Brain, Code2, TestTube2, Bug, Rocket } from "lucide-react";

const STAGES = [
  {
    icon: BookOpen,
    title: "Read",
    body: "Every concept starts with real documentation — official docs, summarized instructional context, never a copy-paste of the source.",
  },
  {
    icon: Brain,
    title: "Understand",
    body: "Knowledge checks in seven formats (recall, explain, predict, debug, architecture, code, design) confirm you actually absorbed it.",
  },
  {
    icon: Code2,
    title: "Implement",
    body: "A real IDE, real constraints, real hidden tests. No solution is shown until you've genuinely attempted it.",
  },
  {
    icon: TestTube2,
    title: "Test",
    body: "Feedback that names what failed and why — never just 'tests failed.'",
  },
  {
    icon: Bug,
    title: "Debug",
    body: "Broken systems with logs, metrics, and traces. You investigate like an engineer, not follow a script.",
  },
  {
    icon: Rocket,
    title: "Build",
    body: "Portfolio-worthy projects with real requirements and acceptance criteria — not tutorials with the blanks filled in.",
  },
];

export default function MethodPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">The Method</p>
      <h1 className="mt-3 font-display text-4xl font-medium text-text">
        AI helps you think. It doesn&rsquo;t think for you.
      </h1>
      <p className="mt-4 max-w-xl text-text-muted">
        Every lesson on FORGE moves through the same six stages. None of them can be
        skipped by watching harder.
      </p>

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {STAGES.map((stage) => (
          <div
            key={stage.title}
            className="rounded-md border border-hairline bg-surface p-6"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-hairline">
              <stage.icon className="h-4 w-4 text-ember" />
            </div>
            <p className="mt-4 font-display text-lg text-text">{stage.title}</p>
            <p className="mt-1.5 text-sm text-text-muted">{stage.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
