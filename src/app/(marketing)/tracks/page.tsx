import Link from "next/link";

const TRACKS = [
  {
    name: "Python",
    accent: "border-signal-info/40",
    focus: [
      "Fundamentals, typing, OOP, async/await",
      "FastAPI, Flask concepts, SQLAlchemy",
      "PostgreSQL, Redis, Celery/background jobs",
      "Testing, Docker, Linux, deployment",
      "System design",
    ],
  },
  {
    name: "JavaScript",
    accent: "border-signal-warn/40",
    focus: [
      "Modern JS, async programming, the event loop",
      "Node.js, npm, Express/Fastify",
      "API development, PostgreSQL, Redis",
      "Authentication, testing, Docker, Linux",
      "System design",
    ],
  },
  {
    name: "Java",
    accent: "border-signal-pass/40",
    focus: [
      "Fundamentals, OOP, collections, generics, streams",
      "Concurrency, Spring Boot, REST APIs",
      "JPA/Hibernate, PostgreSQL, Redis",
      "Authentication, testing, Docker, Linux",
      "System design",
    ],
  },
];

export default function TracksPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Tracks</p>
      <h1 className="mt-3 font-display text-4xl font-medium text-text">
        One core curriculum. Three languages.
      </h1>
      <p className="mt-4 max-w-xl text-text-muted">
        The engineering path is shared — HTTP, databases, testing, deployment, system
        design. The implementation lessons differ by language. Switch tracks any time;
        your progress in each stays separate.
      </p>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {TRACKS.map((track) => (
          <div
            key={track.name}
            className={`rounded-md border bg-surface p-6 ${track.accent}`}
          >
            <p className="font-display text-2xl text-text">{track.name}</p>
            <ul className="mt-5 space-y-2.5">
              {track.focus.map((f) => (
                <li key={f} className="text-sm text-text-muted">
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/select-language"
              className="mt-6 inline-block rounded-md border border-hairline px-4 py-2 text-sm text-text hover:border-text-faint"
            >
              Start with {track.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
