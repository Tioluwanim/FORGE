"""
Seed the database with real starter content — not filler (spec §44).

This mirrors forge-frontend's src/lib/mock-data.ts content 1:1 so that once
the frontend is switched from mock data to real API calls, the UI shows the
same thing it already showed, just from Postgres instead of a TS file.

Run with: python -m scripts.seed
"""

from app.db.models_challenges import Challenge, ChallengeFile, Hint, TestCase
from app.db.models_curriculum import Concept, Lesson, Module, Question
from app.db.models_identity import Language
from app.db.models_platform import Incident
from app.db.models_projects import Project, ProjectMilestone
from app.db.session import Base, SessionLocal, engine


def get_or_create_language(db, code: str, name: str) -> Language:
    lang = db.query(Language).filter(Language.code == code).first()
    if lang is None:
        lang = Language(code=code, name=name)
        db.add(lang)
        db.flush()
    return lang


def seed():
    Base.metadata.create_all(bind=engine)  # dev convenience; use Alembic in real environments
    db = SessionLocal()

    try:
        python = get_or_create_language(db, "python", "Python")
        get_or_create_language(db, "javascript", "JavaScript")
        get_or_create_language(db, "java", "Java")

        # --- Curriculum: modules -> lessons -> concepts -------------------
        fastapi_module = Module(language_id=python.id, title="FastAPI", order_index=1)
        db_module = Module(language_id=python.id, title="Databases", order_index=2)
        async_module = Module(language_id=python.id, title="Async", order_index=3)
        db.add_all([fastapi_module, db_module, async_module])
        db.flush()

        di_lesson = Lesson(
            module_id=fastapi_module.id,
            title="FastAPI — Dependency Injection",
            order_index=1,
            documentation_url="https://fastapi.tiangolo.com/tutorial/dependencies/",
            estimated_minutes=8,
            summary_md=(
                "FastAPI resolves dependencies before your endpoint runs, injecting the "
                "return value as a parameter. This is how you share DB sessions, auth "
                "checks, and config across routes without repeating yourself."
            ),
        )
        pooling_lesson = Lesson(
            module_id=db_module.id,
            title="PostgreSQL — Connection Pooling",
            order_index=1,
            documentation_url="https://www.postgresql.org/docs/current/runtime-config-connection.html",
            estimated_minutes=6,
            summary_md=(
                "Opening a new Postgres connection per request is expensive. A pool keeps "
                "a set of live connections ready, and your app borrows/returns them "
                "instead of paying the handshake cost every time."
            ),
        )
        event_loop_lesson = Lesson(
            module_id=async_module.id,
            title="Concurrency vs Parallelism",
            order_index=1,
            documentation_url="https://docs.python.org/3/library/asyncio-eventloop.html",
            estimated_minutes=10,
            summary_md=(
                "Concurrency is dealing with many things at once; parallelism is doing "
                "many things at once. asyncio gives you the first on a single thread — "
                "it doesn't make your CPU-bound code faster."
            ),
        )
        db.add_all([di_lesson, pooling_lesson, event_loop_lesson])
        db.flush()

        di_concept = Concept(
            lesson_id=di_lesson.id,
            name="FastAPI — Dependency Injection",
            slug="dependency-injection",
            focus_points=["dependency declaration", "dependency resolution", "reusable dependencies", "lifecycle"],
        )
        pooling_concept = Concept(
            lesson_id=pooling_lesson.id,
            name="PostgreSQL — Connection Pooling",
            slug="connection-pooling",
            focus_points=["pool sizing", "connection lifecycle", "exhaustion failure modes"],
        )
        event_loop_concept = Concept(
            lesson_id=event_loop_lesson.id,
            name="Concurrency vs Parallelism",
            slug="event-loop",
            focus_points=["single-threaded concurrency", "I/O-bound vs CPU-bound", "when async actually helps"],
        )
        db.add_all([di_concept, pooling_concept, event_loop_concept])
        db.flush()

        # --- Knowledge check questions --------------------------------------
        db.add_all(
            [
                Question(
                    concept_id=event_loop_concept.id,
                    type="predict",
                    prompt_md="What will `asyncio.gather(coro1(), coro2())` do if `coro1` raises an exception?",
                    answer_format="mcq",
                    correct_answer_json={
                        "options": [
                            "Silently ignore it and return coro2's result",
                            "Cancel coro2 and re-raise immediately by default",
                            "Retry coro1 automatically",
                            "Deadlock",
                        ],
                        "correct_index": 1,
                    },
                    grading_mode="deterministic",
                ),
                Question(
                    concept_id=event_loop_concept.id,
                    type="recall",
                    prompt_md="Does asyncio make CPU-bound code run faster on a single core?",
                    answer_format="mcq",
                    correct_answer_json={
                        "options": ["Yes, always", "No — it only helps with I/O-bound waiting"],
                        "correct_index": 1,
                    },
                    grading_mode="deterministic",
                ),
                Question(
                    concept_id=pooling_concept.id,
                    type="explain",
                    prompt_md="Explain why connection pooling improves throughput under load.",
                    answer_format="free_text",
                    grading_mode="ai_assisted",
                ),
                Question(
                    concept_id=di_concept.id,
                    type="recall",
                    prompt_md="What does FastAPI inject into your endpoint when you declare a dependency?",
                    answer_format="mcq",
                    correct_answer_json={
                        "options": [
                            "The dependency function itself",
                            "The return value of the dependency function",
                            "Nothing until you call it manually",
                            "A promise that resolves later",
                        ],
                        "correct_index": 1,
                    },
                    grading_mode="deterministic",
                ),
            ]
        )

        # --- Challenges -----------------------------------------------------
        retry_harness = '''def run_tests(solution):
    import asyncio, time
    results = []

    async def test_success():
        calls = []
        @solution.retry_with_backoff(max_attempts=3, base_delay=0.01)
        async def always_works():
            calls.append(1)
            return "ok"
        result = await always_works()
        return result == "ok" and len(calls) == 1

    async def test_retry_then_success():
        attempts = {"n": 0}
        @solution.retry_with_backoff(max_attempts=3, base_delay=0.01)
        async def flaky():
            attempts["n"] += 1
            if attempts["n"] < 2:
                raise ValueError("boom")
            return "recovered"
        result = await flaky()
        return result == "recovered" and attempts["n"] == 2

    async def test_gives_up():
        attempts = {"n": 0}
        @solution.retry_with_backoff(max_attempts=3, base_delay=0.01)
        async def always_fails():
            attempts["n"] += 1
            raise ValueError("always broken")
        try:
            await always_fails()
            return False
        except ValueError:
            return attempts["n"] == 3

    async def test_backoff_increases():
        attempts = {"n": 0}
        timestamps = []
        @solution.retry_with_backoff(max_attempts=3, base_delay=0.05)
        async def flaky2():
            timestamps.append(time.monotonic())
            attempts["n"] += 1
            if attempts["n"] < 3:
                raise ValueError("boom")
            return "done"
        await flaky2()
        if len(timestamps) < 3:
            return False
        gap1 = timestamps[1] - timestamps[0]
        gap2 = timestamps[2] - timestamps[1]
        return gap2 > gap1 * 1.5

    cases = [
        ("Succeeds on first attempt", test_success, False),
        ("Retries after failure then succeeds", test_retry_then_success, False),
        ("Gives up after max_attempts and raises", test_gives_up, False),
        ("Backoff delay roughly doubles between retries", test_backoff_increases, True),
    ]
    for name, fn, hidden in cases:
        try:
            passed = asyncio.run(fn())
            results.append({"name": name, "passed": bool(passed), "hidden": hidden})
        except Exception as e:
            results.append({"name": name, "passed": False, "message": f"{type(e).__name__}: {e}", "hidden": hidden})
    return results
'''

        n_plus_one_harness = '''def run_tests(solution):
    results = []

    class _Col:
        def __eq__(self, other):
            return ("eq", other)

    class Customer:
        id = _Col()

    class Order:
        id = _Col()
        customer_id = _Col()

    # The starter code treats Order/Customer as already-imported model
    # classes (as they would be in the real app this snippet is drawn
    # from). Inject them into the solution module's namespace so the
    # learner's function resolves them without needing its own import —
    # the exercise is about the query pattern, not import syntax.
    solution.Order = Order
    solution.Customer = Customer

    class _FakeCustomer:
        def __init__(self, id, name):
            self.id, self.name = id, name

    class _FakeOrder:
        def __init__(self, id, customer_id, total):
            self.id, self.customer_id, self.total = id, customer_id, total

    class _FakeQuery:
        def __init__(self, model, db):
            self.model, self.db = model, db
        def options(self, *a, **kw):
            return self
        def filter(self, *a, **kw):
            return self
        def all(self):
            self.db.query_count += 1
            return list(self.db._orders) if self.model is Order else []
        def first(self):
            self.db.query_count += 1
            if self.model is Customer:
                idx = self.db._next_idx
                self.db._next_idx += 1
                return self.db._customers[idx % len(self.db._customers)]
            return None

    class FakeSession:
        def __init__(self):
            self.query_count = 0
            self._next_idx = 0
            self._customers = [_FakeCustomer(1, "Ada"), _FakeCustomer(2, "Grace"), _FakeCustomer(3, "Alan")]
            self._orders = [_FakeOrder(101, 1, 50), _FakeOrder(102, 2, 75), _FakeOrder(103, 3, 20)]
        def query(self, model):
            return _FakeQuery(model, self)

    try:
        db = FakeSession()
        out = solution.get_orders_with_customers(db)
        passed = isinstance(out, list) and len(out) == 3
        results.append({"name": "Returns one row per order", "passed": passed, "hidden": False})
    except Exception as e:
        results.append({"name": "Returns one row per order", "passed": False, "message": f"{type(e).__name__}: {e}", "hidden": False})

    try:
        db = FakeSession()
        out = solution.get_orders_with_customers(db)
        ok = all(row.get("order") is not None and row.get("customer") is not None for row in out)
        results.append({"name": "Each row includes both order and customer", "passed": ok, "hidden": False})
    except Exception as e:
        results.append({"name": "Each row includes both order and customer", "passed": False, "message": f"{type(e).__name__}: {e}", "hidden": False})

    try:
        db = FakeSession()
        solution.get_orders_with_customers(db)
        passed = db.query_count <= 2
        msg = None if passed else f"Made {db.query_count} queries for 3 orders — still looks like N+1."
        results.append({"name": "Uses a small, constant number of queries", "passed": passed, "message": msg, "hidden": True})
    except Exception as e:
        results.append({"name": "Uses a small, constant number of queries", "passed": False, "message": f"{type(e).__name__}: {e}", "hidden": True})

    return results
'''

        retry_challenge = Challenge(
            concept_id=event_loop_concept.id,
            language_id=python.id,
            title="Implement async retry with backoff",
            difficulty=2,
            description_md=(
                "Write `retry_with_backoff` — an async decorator that retries a failing "
                "coroutine up to `max_attempts` times, doubling the delay between attempts."
            ),
            learning_objectives=["async decorators", "exponential backoff", "exception handling in async code"],
            test_harness_code=retry_harness,
        )
        n_plus_one_challenge = Challenge(
            concept_id=pooling_concept.id,
            language_id=python.id,
            title="Fix the N+1 query",
            difficulty=2,
            description_md=(
                "This endpoint fetches every order, then queries the customer for each "
                "one individually. Fix it to use a single joined query."
            ),
            learning_objectives=["SQLAlchemy eager loading", "N+1 query detection"],
            test_harness_code=n_plus_one_harness,
        )
        db.add_all([retry_challenge, n_plus_one_challenge])
        db.flush()

        db.add_all(
            [
                ChallengeFile(
                    challenge_id=retry_challenge.id,
                    path="solution.py",
                    starter_content=(
                        "import asyncio\n"
                        "from functools import wraps\n\n"
                        "def retry_with_backoff(max_attempts: int = 3, base_delay: float = 0.5):\n"
                        "    def decorator(fn):\n"
                        "        @wraps(fn)\n"
                        "        async def wrapper(*args, **kwargs):\n"
                        "            # TODO: implement retry with exponential backoff\n"
                        "            return await fn(*args, **kwargs)\n"
                        "        return wrapper\n"
                        "    return decorator\n"
                    ),
                ),
                ChallengeFile(
                    challenge_id=n_plus_one_challenge.id,
                    path="solution.py",
                    starter_content=(
                        "# Order, Customer, and db (a SQLAlchemy Session) are already\n"
                        "# available in the real app this function lives in — you don't\n"
                        "# need to import anything here, just fix the query pattern below.\n"
                        "def get_orders_with_customers(db):\n"
                        "    orders = db.query(Order).all()\n"
                        "    result = []\n"
                        "    for order in orders:\n"
                        "        customer = db.query(Customer).filter(Customer.id == order.customer_id).first()\n"
                        "        result.append({\"order\": order, \"customer\": customer})\n"
                        "    return result\n"
                    ),
                ),
            ]
        )

        db.add_all(
            [
                Hint(challenge_id=retry_challenge.id, level=1, content_md="What should happen in the except block on each failed attempt?"),
                Hint(challenge_id=retry_challenge.id, level=2, content_md="Track the current delay separately from the attempt count, and multiply it by 2 each retry."),
                Hint(challenge_id=n_plus_one_challenge.id, level=1, content_md="Look at what SQLAlchemy option lets you eagerly load a relationship in the original query."),
                Hint(challenge_id=n_plus_one_challenge.id, level=2, content_md="`joinedload` or `selectinload` from `sqlalchemy.orm`."),
            ]
        )

        # Test cases use `expected_output_json.contains` as the substring set
        # the dev-only heuristic grader checks for (submissions/sandbox.py).
        # Replace with real input/expected_output pairs once the sandbox runs
        # actual code.
        db.add_all(
            [
                TestCase(challenge_id=retry_challenge.id, name="Succeeds on first attempt", order_index=1, expected_output_json={"contains": ["async def wrapper"]}),
                TestCase(challenge_id=retry_challenge.id, name="Retries after failure", order_index=2, expected_output_json={"contains": ["except"]}),
                TestCase(challenge_id=retry_challenge.id, name="Doubles delay each retry", order_index=3, expected_output_json={"contains": ["*= 2", "* 2"]}),
                TestCase(challenge_id=retry_challenge.id, name="Gives up after max_attempts", order_index=4, expected_output_json={"contains": ["raise", "RuntimeError"]}),
                TestCase(challenge_id=retry_challenge.id, name="Hidden edge case", order_index=5, is_hidden=True, expected_output_json={"contains": ["delay"]}),
                TestCase(challenge_id=n_plus_one_challenge.id, name="Uses eager loading", order_index=1, expected_output_json={"contains": ["joinedload", "selectinload"]}),
                TestCase(challenge_id=n_plus_one_challenge.id, name="Single query, not looped", order_index=2, is_hidden=True, expected_output_json={"contains": ["options("]}),
            ]
        )

        # --- Projects ---------------------------------------------------
        expense_tracker = Project(
            language_id=python.id,
            title="Expense Tracker API",
            difficulty="beginner",
            requirements_md=(
                "A REST API for tracking personal expenses with categories, monthly "
                "summaries, and budget alerts."
            ),
        )
        url_shortener = Project(
            language_id=python.id,
            title="URL Shortener",
            difficulty="intermediate",
            requirements_md=(
                "A URL shortening service with collision-resistant short codes, click "
                "analytics, and Redis-backed caching for redirects."
            ),
        )
        movie_reservation = Project(
            language_id=python.id,
            title="Movie Reservation System",
            difficulty="advanced",
            requirements_md=(
                "Seat-level booking with concurrency-safe reservations, preventing "
                "double-booking under simultaneous requests."
            ),
        )
        db.add_all([expense_tracker, url_shortener, movie_reservation])
        db.flush()

        db.add_all(
            [
                ProjectMilestone(project_id=expense_tracker.id, title="CRUD endpoints for expenses", order_index=1),
                ProjectMilestone(project_id=expense_tracker.id, title="Category filtering + pagination", order_index=2),
                ProjectMilestone(project_id=expense_tracker.id, title="Monthly summary aggregation", order_index=3),
                ProjectMilestone(project_id=expense_tracker.id, title="Budget alert logic + tests", order_index=4),
                ProjectMilestone(project_id=url_shortener.id, title="Short code generation", order_index=1),
                ProjectMilestone(project_id=url_shortener.id, title="Redirect endpoint + Redis cache", order_index=2),
                ProjectMilestone(project_id=url_shortener.id, title="Click analytics", order_index=3),
                ProjectMilestone(project_id=url_shortener.id, title="Rate limiting", order_index=4),
                ProjectMilestone(project_id=movie_reservation.id, title="Data model + migrations", order_index=1),
                ProjectMilestone(project_id=movie_reservation.id, title="Seat locking under concurrency", order_index=2),
                ProjectMilestone(project_id=movie_reservation.id, title="Booking + cancellation flow", order_index=3),
                ProjectMilestone(project_id=movie_reservation.id, title="Load test for race conditions", order_index=4),
            ]
        )

        # --- Incident (Debugging Lab) -------------------------------------
        db.add(
            Incident(
                title="API latency spike under load",
                difficulty=2,
                metrics_fixture_json={
                    "api_latency": {"from": "120ms", "to": "4.7s", "severity": "critical"},
                    "error_rate": {"from": "0.4%", "to": "5.1%", "severity": "critical"},
                    "database_cpu": {"from": "12%", "to": "94%", "severity": "critical"},
                    "redis": {"from": "Normal", "to": "Normal", "severity": "normal"},
                },
                logs_fixture_json={
                    "lines": [
                        "12:03:41 WARN  slow query detected: SELECT * FROM orders WHERE ... (3400ms)",
                        "12:03:44 WARN  connection pool exhausted, waiting for available connection",
                        "12:03:52 ERROR request timeout after 5000ms — GET /api/orders",
                    ]
                },
                root_cause_md=(
                    "The orders endpoint ran an unindexed query that got slower as the "
                    "table grew. Under load, slow queries held connections open long "
                    "enough to exhaust the pool, cascading into timeouts across the API."
                ),
                diagnosis_grading_json={"keywords": ["index", "connection pool", "slow query"]},
            )
        )

        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
