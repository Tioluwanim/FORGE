// Mock/seed data for the frontend-only build. Replace with real API calls
// (TanStack Query hooks against the FastAPI backend) once it exists — see
// forge-architecture-plan.md §35 for the schema this mirrors.

export type Language = "python" | "javascript" | "java";

export interface TrackProgress {
  language: Language;
  label: string;
  pct: number;
  status: "not_started" | "in_progress";
}

export const TRACKS: TrackProgress[] = [
  { language: "python", label: "Python", pct: 72, status: "in_progress" },
  { language: "javascript", label: "JavaScript", pct: 34, status: "in_progress" },
  { language: "java", label: "Java", pct: 0, status: "not_started" },
];

export const WEAK_AREAS = [
  { concept: "PostgreSQL Transactions", pct: 41 },
  { concept: "Concurrency", pct: 48 },
  { concept: "Redis", pct: 58 },
  { concept: "Testing", pct: 63 },
];

export const TODAYS_PRACTICE = [
  { id: "q1", title: "Explain connection pooling", type: "explain", estMinutes: 4 },
  { id: "c1", title: "Fix the N+1 query", type: "debug", estMinutes: 12 },
  { id: "c2", title: "Implement async retry with backoff", type: "code", estMinutes: 18 },
];

export const ROADMAP: {
  title: string;
  status: "mastered" | "learning" | "weak" | "locked" | "recommended" | "review_required";
  masteryPct?: number;
}[] = [
  { title: "Python", status: "mastered", masteryPct: 96 },
  { title: "HTTP", status: "mastered", masteryPct: 91 },
  { title: "FastAPI", status: "learning", masteryPct: 68 },
  { title: "Databases", status: "weak", masteryPct: 41 },
  { title: "Authentication", status: "learning", masteryPct: 55 },
  { title: "Testing", status: "review_required", masteryPct: 63 },
  { title: "Async", status: "recommended" },
  { title: "Redis", status: "locked" },
  { title: "Queues", status: "locked" },
  { title: "Docker", status: "locked" },
  { title: "Linux", status: "locked" },
  { title: "Deployment", status: "locked" },
  { title: "Observability", status: "locked" },
  { title: "System Design", status: "locked" },
  { title: "Distributed Systems", status: "locked" },
];

export const CONCEPTS = [
  {
    slug: "dependency-injection",
    title: "FastAPI — Dependency Injection",
    module: "FastAPI",
    estMinutes: 8,
    docUrl: "https://fastapi.tiangolo.com/tutorial/dependencies/",
    focus: [
      "dependency declaration",
      "dependency resolution",
      "reusable dependencies",
      "lifecycle",
    ],
    summary:
      "FastAPI resolves dependencies before your endpoint runs, injecting the return value as a parameter. This is how you share DB sessions, auth checks, and config across routes without repeating yourself.",
  },
  {
    slug: "connection-pooling",
    title: "PostgreSQL — Connection Pooling",
    module: "Databases",
    estMinutes: 6,
    docUrl: "https://www.postgresql.org/docs/current/runtime-config-connection.html",
    focus: ["pool sizing", "connection lifecycle", "exhaustion failure modes"],
    summary:
      "Opening a new Postgres connection per request is expensive. A pool keeps a set of live connections ready, and your app borrows/returns them instead of paying the handshake cost every time.",
  },
  {
    slug: "event-loop",
    title: "Concurrency vs Parallelism",
    module: "Async",
    estMinutes: 10,
    docUrl: "https://docs.python.org/3/library/asyncio-eventloop.html",
    focus: ["single-threaded concurrency", "I/O-bound vs CPU-bound", "when async actually helps"],
    summary:
      "Concurrency is dealing with many things at once; parallelism is doing many things at once. asyncio gives you the first on a single thread — it doesn't make your CPU-bound code faster.",
  },
];

export const CHALLENGES = [
  {
    id: "async-retry",
    title: "Implement async retry with backoff",
    language: "python" as Language,
    difficulty: "Intermediate",
    concept: "Async",
    description:
      "Write `retry_with_backoff` — an async decorator that retries a failing coroutine up to `max_attempts` times, doubling the delay between attempts.",
    starter: `import asyncio
from functools import wraps

def retry_with_backoff(max_attempts: int = 3, base_delay: float = 0.5):
    def decorator(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            # TODO: implement retry with exponential backoff
            return await fn(*args, **kwargs)
        return wrapper
    return decorator
`,
    hints: [
      "Hint 1: what should happen in the except block on each failed attempt?",
      "Hint 2: track the current delay separately from the attempt count, and multiply it by 2 each retry.",
    ],
  },
  {
    id: "n-plus-one",
    title: "Fix the N+1 query",
    language: "python" as Language,
    difficulty: "Intermediate",
    concept: "Databases",
    description:
      "This endpoint fetches every order, then queries the customer for each one individually. Fix it to use a single joined query.",
    starter: `def get_orders_with_customers(db: Session):
    orders = db.query(Order).all()
    result = []
    for order in orders:
        customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
        result.append({"order": order, "customer": customer})
    return result
`,
    hints: [
      "Hint 1: look at what SQLAlchemy option lets you eagerly load a relationship in the original query.",
      "Hint 2: `joinedload` or `selectinload` from `sqlalchemy.orm`.",
    ],
  },
];

export const PROJECTS = [
  {
    id: "expense-tracker-api",
    title: "Expense Tracker API",
    difficulty: "Beginner" as const,
    language: "python" as Language,
    description:
      "A REST API for tracking personal expenses with categories, monthly summaries, and budget alerts.",
    milestones: [
      { title: "CRUD endpoints for expenses", done: true },
      { title: "Category filtering + pagination", done: true },
      { title: "Monthly summary aggregation", done: false },
      { title: "Budget alert logic + tests", done: false },
    ],
  },
  {
    id: "url-shortener",
    title: "URL Shortener",
    difficulty: "Intermediate" as const,
    language: "python" as Language,
    description:
      "A URL shortening service with collision-resistant short codes, click analytics, and Redis-backed caching for redirects.",
    milestones: [
      { title: "Short code generation", done: true },
      { title: "Redirect endpoint + Redis cache", done: false },
      { title: "Click analytics", done: false },
      { title: "Rate limiting", done: false },
    ],
  },
  {
    id: "movie-reservation-system",
    title: "Movie Reservation System",
    difficulty: "Advanced" as const,
    language: "python" as Language,
    description:
      "Seat-level booking with concurrency-safe reservations, preventing double-booking under simultaneous requests.",
    milestones: [
      { title: "Data model + migrations", done: false },
      { title: "Seat locking under concurrency", done: false },
      { title: "Booking + cancellation flow", done: false },
      { title: "Load test for race conditions", done: false },
    ],
  },
];

export const INCIDENTS = [
  {
    id: "014",
    title: "API latency spike under load",
    metrics: [
      { label: "API latency", from: "120ms", to: "4.7s", severity: "critical" as const },
      { label: "Error rate", from: "0.4%", to: "5.1%", severity: "critical" as const },
      { label: "Database CPU", from: "12%", to: "94%", severity: "critical" as const },
      { label: "Redis", from: "Normal", to: "Normal", severity: "normal" as const },
    ],
    logs: [
      "12:03:41 WARN  slow query detected: SELECT * FROM orders WHERE ... (3400ms)",
      "12:03:44 WARN  connection pool exhausted, waiting for available connection",
      "12:03:52 ERROR request timeout after 5000ms — GET /api/orders",
    ],
  },
];

export const REVIEWS = [
  { concept: "Concurrency", dueIn: "Today", stage: "Day 7" },
  { concept: "SQL Joins", dueIn: "Today", stage: "Day 21" },
  { concept: "HTTP Status Codes", dueIn: "In 2 days", stage: "Day 2" },
  { concept: "Dependency Injection", dueIn: "In 5 days", stage: "Day 45" },
];

export const AI_MENTOR_TRANSCRIPT = [
  { role: "system" as const, text: "Context: challenge \u201cFix the N+1 query\u201d — 2 of 5 tests failing." },
  { role: "user" as const, text: "I don't get why my tests are failing, the query looks right to me" },
  {
    role: "assistant" as const,
    text: "Look at the lifecycle of the database session in your loop. What happens to the number of queries as the order list grows?",
  },
  { role: "user" as const, text: "It queries once per order I guess? still stuck" },
  {
    role: "assistant" as const,
    text: "Right — that's the N+1 pattern. SQLAlchemy has a way to fetch a relationship in the same query as the parent. What's the option called that eagerly loads related rows?",
  },
];
