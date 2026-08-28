"""
FORGE starter-content seeder.

Run:
    python -m scripts.seed

The seeder is intentionally idempotent:
running it multiple times updates existing starter content instead of
creating duplicate rows.

It seeds:
- Languages
- Curriculum modules / lessons / concepts
- Knowledge-check questions
- Coding challenges / files / hints / test cases
- Projects / milestones
- Production debugging incidents

This is application content, not user-generated data.
For production schema changes, use Alembic migrations.
"""

from __future__ import annotations

from typing import Any

from app.db.models_challenges import Challenge, ChallengeFile, Hint, TestCase
from app.db.models_curriculum import Concept, Lesson, Module, Question
from app.db.models_identity import Language
from app.db.models_platform import Incident
from app.db.models_projects import Project, ProjectMilestone
from app.db.session import Base, SessionLocal, engine


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_or_create_language(
    db,
    code: str,
    name: str,
) -> Language:
    language = db.query(Language).filter(Language.code == code).first()

    if language is None:
        language = Language(code=code, name=name)
        db.add(language)
        db.flush()

    return language


def get_or_create_module(
    db,
    *,
    language_id: Any,
    title: str,
    order_index: int,
) -> Module:
    module = (
        db.query(Module)
        .filter(
            Module.language_id == language_id,
            Module.title == title,
        )
        .first()
    )

    if module is None:
        module = Module(
            language_id=language_id,
            title=title,
            order_index=order_index,
        )
        db.add(module)
        db.flush()

    return module


def get_or_create_lesson(
    db,
    *,
    module_id: Any,
    title: str,
    order_index: int,
    documentation_url: str | None,
    estimated_minutes: int,
    summary_md: str,
) -> Lesson:
    lesson = (
        db.query(Lesson)
        .filter(
            Lesson.module_id == module_id,
            Lesson.title == title,
        )
        .first()
    )

    if lesson is None:
        lesson = Lesson(
            module_id=module_id,
            title=title,
            order_index=order_index,
            documentation_url=documentation_url,
            estimated_minutes=estimated_minutes,
            summary_md=summary_md,
        )
        db.add(lesson)
        db.flush()
    else:
        lesson.order_index = order_index
        lesson.documentation_url = documentation_url
        lesson.estimated_minutes = estimated_minutes
        lesson.summary_md = summary_md

    return lesson


def get_or_create_concept(
    db,
    *,
    lesson_id: Any,
    name: str,
    slug: str,
    focus_points: list[str],
) -> Concept:
    concept = (
        db.query(Concept)
        .filter(Concept.slug == slug)
        .first()
    )

    if concept is None:
        concept = Concept(
            lesson_id=lesson_id,
            name=name,
            slug=slug,
            focus_points=focus_points,
        )
        db.add(concept)
        db.flush()
    else:
        concept.lesson_id = lesson_id
        concept.name = name
        concept.focus_points = focus_points

    return concept


def get_or_create_question(
    db,
    *,
    concept_id: Any,
    prompt_md: str,
    question_type: str,
    answer_format: str,
    grading_mode: str,
    correct_answer_json: dict[str, Any] | None = None,
) -> Question:
    question = (
        db.query(Question)
        .filter(
            Question.concept_id == concept_id,
            Question.prompt_md == prompt_md,
        )
        .first()
    )

    if question is None:
        question = Question(
            concept_id=concept_id,
            type=question_type,
            prompt_md=prompt_md,
            answer_format=answer_format,
            grading_mode=grading_mode,
            correct_answer_json=correct_answer_json,
        )
        db.add(question)
        db.flush()
    else:
        question.type = question_type
        question.answer_format = answer_format
        question.grading_mode = grading_mode
        question.correct_answer_json = correct_answer_json

    return question


def get_or_create_challenge(
    db,
    *,
    concept_id: Any,
    language_id: Any,
    title: str,
    difficulty: int,
    description_md: str,
    learning_objectives: list[str],
) -> Challenge:
    challenge = (
        db.query(Challenge)
        .filter(Challenge.title == title)
        .first()
    )

    if challenge is None:
        challenge = Challenge(
            concept_id=concept_id,
            language_id=language_id,
            title=title,
            difficulty=difficulty,
            description_md=description_md,
            learning_objectives=learning_objectives,
        )
        db.add(challenge)
        db.flush()
    else:
        challenge.concept_id = concept_id
        challenge.language_id = language_id
        challenge.difficulty = difficulty
        challenge.description_md = description_md
        challenge.learning_objectives = learning_objectives

    return challenge


def get_or_create_challenge_file(
    db,
    *,
    challenge_id: Any,
    path: str,
    starter_content: str,
    is_editable: bool = True,
) -> ChallengeFile:
    item = (
        db.query(ChallengeFile)
        .filter(
            ChallengeFile.challenge_id == challenge_id,
            ChallengeFile.path == path,
        )
        .first()
    )

    if item is None:
        item = ChallengeFile(
            challenge_id=challenge_id,
            path=path,
            starter_content=starter_content,
            is_editable=is_editable,
        )
        db.add(item)
        db.flush()
    else:
        item.starter_content = starter_content
        item.is_editable = is_editable

    return item


def get_or_create_hint(
    db,
    *,
    challenge_id: Any,
    level: int,
    content_md: str,
) -> Hint:
    hint = (
        db.query(Hint)
        .filter(
            Hint.challenge_id == challenge_id,
            Hint.level == level,
        )
        .first()
    )

    if hint is None:
        hint = Hint(
            challenge_id=challenge_id,
            level=level,
            content_md=content_md,
        )
        db.add(hint)
        db.flush()
    else:
        hint.content_md = content_md

    return hint


def get_or_create_test_case(
    db,
    *,
    challenge_id: Any,
    name: str,
    order_index: int,
    expected_output_json: dict[str, Any],
    is_hidden: bool = False,
) -> TestCase:
    test_case = (
        db.query(TestCase)
        .filter(
            TestCase.challenge_id == challenge_id,
            TestCase.name == name,
        )
        .first()
    )

    if test_case is None:
        test_case = TestCase(
            challenge_id=challenge_id,
            name=name,
            order_index=order_index,
            expected_output_json=expected_output_json,
            is_hidden=is_hidden,
        )
        db.add(test_case)
        db.flush()
    else:
        test_case.order_index = order_index
        test_case.expected_output_json = expected_output_json
        test_case.is_hidden = is_hidden

    return test_case


def get_or_create_project(
    db,
    *,
    language_id: Any,
    title: str,
    difficulty: str,
    requirements_md: str,
) -> Project:
    project = (
        db.query(Project)
        .filter(Project.title == title)
        .first()
    )

    if project is None:
        project = Project(
            language_id=language_id,
            title=title,
            difficulty=difficulty,
            requirements_md=requirements_md,
        )
        db.add(project)
        db.flush()
    else:
        project.language_id = language_id
        project.difficulty = difficulty
        project.requirements_md = requirements_md

    return project


def get_or_create_milestone(
    db,
    *,
    project_id: Any,
    title: str,
    order_index: int,
) -> ProjectMilestone:
    milestone = (
        db.query(ProjectMilestone)
        .filter(
            ProjectMilestone.project_id == project_id,
            ProjectMilestone.title == title,
        )
        .first()
    )

    if milestone is None:
        milestone = ProjectMilestone(
            project_id=project_id,
            title=title,
            order_index=order_index,
        )
        db.add(milestone)
        db.flush()

    return milestone


def get_or_create_incident(
    db,
    *,
    title: str,
    difficulty: int,
    metrics_fixture_json: dict[str, Any],
    logs_fixture_json: dict[str, Any],
    root_cause_md: str,
    diagnosis_grading_json: dict[str, Any],
) -> Incident:
    incident = (
        db.query(Incident)
        .filter(Incident.title == title)
        .first()
    )

    if incident is None:
        incident = Incident(
            title=title,
            difficulty=difficulty,
            metrics_fixture_json=metrics_fixture_json,
            logs_fixture_json=logs_fixture_json,
            root_cause_md=root_cause_md,
            diagnosis_grading_json=diagnosis_grading_json,
        )
        db.add(incident)
        db.flush()
    else:
        incident.difficulty = difficulty
        incident.metrics_fixture_json = metrics_fixture_json
        incident.logs_fixture_json = logs_fixture_json
        incident.root_cause_md = root_cause_md
        incident.diagnosis_grading_json = diagnosis_grading_json

    return incident


# ---------------------------------------------------------------------------
# Seed
# ---------------------------------------------------------------------------

def seed() -> None:
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # ===================================================================
        # LANGUAGES
        # ===================================================================

        python = get_or_create_language(db, "python", "Python")
        javascript = get_or_create_language(db, "javascript", "JavaScript")
        java = get_or_create_language(db, "java", "Java")

        # ===================================================================
        # PYTHON CURRICULUM
        # ===================================================================

        py_fastapi = get_or_create_module(
            db,
            language_id=python.id,
            title="FastAPI Foundations",
            order_index=1,
        )

        py_database = get_or_create_module(
            db,
            language_id=python.id,
            title="Databases & SQLAlchemy",
            order_index=2,
        )

        py_async = get_or_create_module(
            db,
            language_id=python.id,
            title="Async Python",
            order_index=3,
        )

        py_testing = get_or_create_module(
            db,
            language_id=python.id,
            title="Testing & Reliability",
            order_index=4,
        )

        py_architecture = get_or_create_module(
            db,
            language_id=python.id,
            title="Backend Architecture",
            order_index=5,
        )

        py_di_lesson = get_or_create_lesson(
            db,
            module_id=py_fastapi.id,
            title="FastAPI Dependency Injection",
            order_index=1,
            documentation_url="https://fastapi.tiangolo.com/tutorial/dependencies/",
            estimated_minutes=12,
            summary_md=(
                "Learn how FastAPI resolves dependencies before your endpoint "
                "runs. Use dependency injection for database sessions, "
                "authentication, configuration, and reusable application logic."
            ),
        )

        py_validation_lesson = get_or_create_lesson(
            db,
            module_id=py_fastapi.id,
            title="Request Validation with Pydantic",
            order_index=2,
            documentation_url="https://docs.pydantic.dev/latest/",
            estimated_minutes=15,
            summary_md=(
                "Model API input explicitly with Pydantic. Learn how validation "
                "protects route handlers and produces useful HTTP 422 responses."
            ),
        )

        py_pool_lesson = get_or_create_lesson(
            db,
            module_id=py_database.id,
            title="PostgreSQL Connection Pooling",
            order_index=1,
            documentation_url="https://docs.sqlalchemy.org/en/20/core/pooling.html",
            estimated_minutes=12,
            summary_md=(
                "Understand how SQLAlchemy pools database connections and why "
                "pool exhaustion appears as latency and timeout problems under load."
            ),
        )

        py_queries_lesson = get_or_create_lesson(
            db,
            module_id=py_database.id,
            title="Query Design & N+1 Problems",
            order_index=2,
            documentation_url="https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html",
            estimated_minutes=18,
            summary_md=(
                "Learn how inefficient relationship loading produces N+1 query "
                "patterns and how eager-loading strategies reduce database work."
            ),
        )

        py_async_lesson = get_or_create_lesson(
            db,
            module_id=py_async.id,
            title="Concurrency vs Parallelism",
            order_index=1,
            documentation_url="https://docs.python.org/3/library/asyncio.html",
            estimated_minutes=14,
            summary_md=(
                "Understand what asyncio actually solves. Concurrency is about "
                "progress across waiting tasks; CPU-bound work still needs a "
                "different strategy."
            ),
        )

        py_retry_lesson = get_or_create_lesson(
            db,
            module_id=py_async.id,
            title="Retries, Backoff & Resilience",
            order_index=2,
            documentation_url="https://docs.python.org/3/library/asyncio-task.html",
            estimated_minutes=16,
            summary_md=(
                "Design retry loops that avoid hammering failing services. "
                "Learn bounded retries, exponential backoff, and failure handling."
            ),
        )

        py_testing_lesson = get_or_create_lesson(
            db,
            module_id=py_testing.id,
            title="Testing FastAPI Services",
            order_index=1,
            documentation_url="https://fastapi.tiangolo.com/tutorial/testing/",
            estimated_minutes=16,
            summary_md=(
                "Test API behavior rather than implementation details. Learn "
                "request/response assertions, dependency overrides, and isolation."
            ),
        )

        py_arch_lesson = get_or_create_lesson(
            db,
            module_id=py_architecture.id,
            title="Service Boundaries",
            order_index=1,
            documentation_url="https://12factor.net/",
            estimated_minutes=18,
            summary_md=(
                "Decide where business logic belongs. Keep routers thin, isolate "
                "external integrations, and make core behavior testable without HTTP."
            ),
        )

        # Concepts
        py_di = get_or_create_concept(
            db,
            lesson_id=py_di_lesson.id,
            name="FastAPI Dependency Injection",
            slug="python-fastapi-dependency-injection",
            focus_points=[
                "Depends",
                "dependency resolution",
                "database session lifecycle",
                "reusable dependencies",
            ],
        )

        py_validation = get_or_create_concept(
            db,
            lesson_id=py_validation_lesson.id,
            name="Pydantic Request Validation",
            slug="python-pydantic-validation",
            focus_points=[
                "BaseModel",
                "field validation",
                "EmailStr",
                "HTTP 422 responses",
            ],
        )

        py_pool = get_or_create_concept(
            db,
            lesson_id=py_pool_lesson.id,
            name="SQLAlchemy Connection Pooling",
            slug="python-sqlalchemy-connection-pooling",
            focus_points=[
                "pool size",
                "connection checkout",
                "pool exhaustion",
                "pre-ping",
            ],
        )

        py_n_plus_one = get_or_create_concept(
            db,
            lesson_id=py_queries_lesson.id,
            name="N+1 Query Detection",
            slug="python-n-plus-one",
            focus_points=[
                "relationship loading",
                "joinedload",
                "selectinload",
                "query count",
            ],
        )

        py_event_loop = get_or_create_concept(
            db,
            lesson_id=py_async_lesson.id,
            name="Concurrency vs Parallelism",
            slug="python-concurrency-vs-parallelism",
            focus_points=[
                "event loop",
                "I/O-bound work",
                "CPU-bound work",
                "task scheduling",
            ],
        )

        py_backoff = get_or_create_concept(
            db,
            lesson_id=py_retry_lesson.id,
            name="Exponential Backoff",
            slug="python-exponential-backoff",
            focus_points=[
                "bounded retries",
                "delay growth",
                "exception handling",
                "transient failures",
            ],
        )

        py_testing = get_or_create_concept(
            db,
            lesson_id=py_testing_lesson.id,
            name="API Testing",
            slug="python-fastapi-testing",
            focus_points=[
                "pytest",
                "TestClient",
                "dependency overrides",
                "behavioral assertions",
            ],
        )

        py_architecture = get_or_create_concept(
            db,
            lesson_id=py_arch_lesson.id,
            name="Backend Service Boundaries",
            slug="python-backend-service-boundaries",
            focus_points=[
                "thin routers",
                "service layer",
                "external integrations",
                "testability",
            ],
        )

        # Questions
        get_or_create_question(
            db,
            concept_id=py_di.id,
            question_type="recall",
            prompt_md="What does FastAPI inject when you declare `Depends(get_db)`?",
            answer_format="mcq",
            grading_mode="deterministic",
            correct_answer_json={
                "options": [
                    "The source code of get_db",
                    "The value yielded/returned by the dependency",
                    "A database URL string",
                    "Nothing until you manually call get_db",
                ],
                "correct_index": 1,
            },
        )

        get_or_create_question(
            db,
            concept_id=py_validation.id,
            question_type="predict",
            prompt_md="What status code does FastAPI normally return when a request body fails Pydantic validation?",
            answer_format="mcq",
            grading_mode="deterministic",
            correct_answer_json={
                "options": ["200", "201", "404", "422"],
                "correct_index": 3,
            },
        )

        get_or_create_question(
            db,
            concept_id=py_pool.id,
            question_type="explain",
            prompt_md="Why can connection-pool exhaustion cause requests to become slow even when the database itself is still healthy?",
            answer_format="free_text",
            grading_mode="ai_assisted",
        )

        get_or_create_question(
            db,
            concept_id=py_n_plus_one.id,
            question_type="predict",
            prompt_md="What is the main performance problem with querying the customer separately inside a loop over orders?",
            answer_format="mcq",
            grading_mode="deterministic",
            correct_answer_json={
                "options": [
                    "It prevents transactions",
                    "It can create one extra query per order",
                    "It makes indexes unusable",
                    "It automatically deletes relationships",
                ],
                "correct_index": 1,
            },
        )

        get_or_create_question(
            db,
            concept_id=py_event_loop.id,
            question_type="recall",
            prompt_md="Does asyncio automatically make CPU-bound Python work faster on one core?",
            answer_format="mcq",
            grading_mode="deterministic",
            correct_answer_json={
                "options": [
                    "Yes",
                    "No",
                ],
                "correct_index": 1,
            },
        )

        get_or_create_question(
            db,
            concept_id=py_backoff.id,
            question_type="explain",
            prompt_md="Why should a retry strategy increase the delay between attempts?",
            answer_format="free_text",
            grading_mode="ai_assisted",
        )

        get_or_create_question(
            db,
            concept_id=py_testing.id,
            question_type="recall",
            prompt_md="What is the purpose of a FastAPI dependency override in tests?",
            answer_format="mcq",
            grading_mode="deterministic",
            correct_answer_json={
                "options": [
                    "To skip all assertions",
                    "To replace a real dependency with a controlled test implementation",
                    "To disable Pydantic",
                    "To make requests asynchronous",
                ],
                "correct_index": 1,
            },
        )

        # Challenges
        retry_challenge = get_or_create_challenge(
            db,
            concept_id=py_backoff.id,
            language_id=python.id,
            title="Implement Async Retry with Exponential Backoff",
            difficulty=2,
            description_md=(
                "Implement `retry_with_backoff` as an async decorator. "
                "Retry a failing coroutine up to `max_attempts`, doubling the "
                "delay after each failure. Preserve the wrapped function metadata "
                "and re-raise the final exception."
            ),
            learning_objectives=[
                "async decorators",
                "exception handling",
                "exponential backoff",
                "bounded retries",
            ],
        )

        get_or_create_challenge_file(
            db,
            challenge_id=retry_challenge.id,
            path="solution.py",
            starter_content=(
                "import asyncio\n"
                "from functools import wraps\n\n"
                "def retry_with_backoff(max_attempts: int = 3, base_delay: float = 0.5):\n"
                "    def decorator(fn):\n"
                "        @wraps(fn)\n"
                "        async def wrapper(*args, **kwargs):\n"
                "            # TODO: implement bounded retries.\n"
                "            pass\n"
                "        return wrapper\n"
                "    return decorator\n"
            ),
        )

        get_or_create_hint(
            db,
            challenge_id=retry_challenge.id,
            level=1,
            content_md=(
                "Start by thinking about what state must survive between attempts: "
                "the current attempt number and the current delay."
            ),
        )

        get_or_create_hint(
            db,
            challenge_id=retry_challenge.id,
            level=2,
            content_md=(
                "Put the call inside `try/except`. After a failure, wait with "
                "`asyncio.sleep(delay)`, then double the delay for the next attempt."
            ),
        )

        get_or_create_hint(
            db,
            challenge_id=retry_challenge.id,
            level=3,
            content_md=(
                "The last failure should escape the wrapper. Avoid swallowing the "
                "exception after the maximum number of attempts."
            ),
        )

        get_or_create_test_case(
            db,
            challenge_id=retry_challenge.id,
            name="Preserves async wrapper",
            order_index=1,
            expected_output_json={"contains": ["async def wrapper"]},
        )

        get_or_create_test_case(
            db,
            challenge_id=retry_challenge.id,
            name="Handles failures",
            order_index=2,
            expected_output_json={"contains": ["except"]},
        )

        get_or_create_test_case(
            db,
            challenge_id=retry_challenge.id,
            name="Waits between retries",
            order_index=3,
            expected_output_json={"contains": ["asyncio.sleep"]},
        )

        get_or_create_test_case(
            db,
            challenge_id=retry_challenge.id,
            name="Doubles delay",
            order_index=4,
            expected_output_json={"contains": ["delay", "*= 2"]},
        )

        get_or_create_test_case(
            db,
            challenge_id=retry_challenge.id,
            name="Re-raises final failure",
            order_index=5,
            expected_output_json={"contains": ["raise"]},
            is_hidden=True,
        )

        n_plus_one_challenge = get_or_create_challenge(
            db,
            concept_id=py_n_plus_one.id,
            language_id=python.id,
            title="Eliminate an N+1 Query",
            difficulty=2,
            description_md=(
                "Refactor an order-loading function so customer relationships "
                "are loaded efficiently instead of issuing a separate query "
                "inside the loop."
            ),
            learning_objectives=[
                "N+1 diagnosis",
                "SQLAlchemy relationship loading",
                "query planning",
            ],
        )

        get_or_create_challenge_file(
            db,
            challenge_id=n_plus_one_challenge.id,
            path="solution.py",
            starter_content=(
                "from sqlalchemy.orm import Session\n\n"
                "def get_orders_with_customers(db: Session):\n"
                "    orders = db.query(Order).all()\n"
                "    result = []\n"
                "    for order in orders:\n"
                "        customer = (\n"
                "            db.query(Customer)\n"
                "            .filter(Customer.id == order.customer_id)\n"
                "            .first()\n"
                "        )\n"
                "        result.append({\"order\": order, \"customer\": customer})\n"
                "    return result\n"
            ),
        )

        get_or_create_hint(
            db,
            challenge_id=n_plus_one_challenge.id,
            level=1,
            content_md=(
                "The problem is not the Python loop by itself. Count how many "
                "database round trips happen as the number of orders increases."
            ),
        )

        get_or_create_hint(
            db,
            challenge_id=n_plus_one_challenge.id,
            level=2,
            content_md=(
                "SQLAlchemy can load relationships while fetching the parent rows. "
                "Look at `joinedload` and `selectinload`."
            ),
        )

        get_or_create_test_case(
            db,
            challenge_id=n_plus_one_challenge.id,
            name="Uses relationship loading",
            order_index=1,
            expected_output_json={"contains_any": ["joinedload", "selectinload"]},
        )

        get_or_create_test_case(
            db,
            challenge_id=n_plus_one_challenge.id,
            name="Avoids query inside order loop",
            order_index=2,
            expected_output_json={"contains": ["options("]},
            is_hidden=True,
        )

        validation_challenge = get_or_create_challenge(
            db,
            concept_id=py_validation.id,
            language_id=python.id,
            title="Build a Strict Signup Schema",
            difficulty=1,
            description_md=(
                "Create a Pydantic signup model that validates email format, "
                "requires a strong enough password, and rejects an empty display name."
            ),
            learning_objectives=[
                "Pydantic models",
                "field constraints",
                "EmailStr",
                "validation behavior",
            ],
        )

        get_or_create_challenge_file(
            db,
            challenge_id=validation_challenge.id,
            path="solution.py",
            starter_content=(
                "from pydantic import BaseModel, EmailStr, Field\n\n"
                "class SignupRequest(BaseModel):\n"
                "    email: EmailStr\n"
                "    password: str = Field(..., min_length=8)\n"
                "    display_name: str = Field(..., min_length=1, max_length=120)\n"
            ),
        )

        get_or_create_hint(
            db,
            challenge_id=validation_challenge.id,
            level=1,
            content_md=(
                "The type annotation should communicate that the value is an email, "
                "not just an arbitrary string."
            ),
        )

        get_or_create_hint(
            db,
            challenge_id=validation_challenge.id,
            level=2,
            content_md=(
                "Use `EmailStr` for the email field and `Field` constraints for "
                "password length and display-name length."
            ),
        )

        get_or_create_test_case(
            db,
            challenge_id=validation_challenge.id,
            name="Uses EmailStr",
            order_index=1,
            expected_output_json={"contains": ["EmailStr"]},
        )

        get_or_create_test_case(
            db,
            challenge_id=validation_challenge.id,
            name="Minimum password length",
            order_index=2,
            expected_output_json={"contains": ["min_length=8"]},
        )

        get_or_create_test_case(
            db,
            challenge_id=validation_challenge.id,
            name="Display name bounds",
            order_index=3,
            expected_output_json={"contains": ["display_name"]},
            is_hidden=True,
        )

        # ===================================================================
        # JAVASCRIPT CURRICULUM
        # ===================================================================

        js_core = get_or_create_module(
            db,
            language_id=javascript.id,
            title="JavaScript Foundations",
            order_index=1,
        )

        js_async = get_or_create_module(
            db,
            language_id=javascript.id,
            title="Async JavaScript",
            order_index=2,
        )

        js_backend = get_or_create_module(
            db,
            language_id=javascript.id,
            title="Node.js Backend",
            order_index=3,
        )

        js_typescript = get_or_create_module(
            db,
            language_id=javascript.id,
            title="TypeScript & Maintainability",
            order_index=4,
        )

        js_event_loop_lesson = get_or_create_lesson(
            db,
            module_id=js_async.id,
            title="The JavaScript Event Loop",
            order_index=1,
            documentation_url="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop",
            estimated_minutes=15,
            summary_md=(
                "Understand call stacks, queues, promises, and how JavaScript "
                "coordinates asynchronous work without blocking the main thread."
            ),
        )

        js_promises_lesson = get_or_create_lesson(
            db,
            module_id=js_async.id,
            title="Promises & Async/Await",
            order_index=2,
            documentation_url="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
            estimated_minutes=14,
            summary_md=(
                "Compose asynchronous operations safely with promises and "
                "async/await. Learn why error handling must follow the promise chain."
            ),
        )

        js_node_lesson = get_or_create_lesson(
            db,
            module_id=js_backend.id,
            title="Node.js HTTP Services",
            order_index=1,
            documentation_url="https://nodejs.org/docs/latest/api/http.html",
            estimated_minutes=18,
            summary_md=(
                "Build HTTP services in Node.js and reason about routing, "
                "request lifecycles, and asynchronous I/O."
            ),
        )

        js_types_lesson = get_or_create_lesson(
            db,
            module_id=js_typescript.id,
            title="TypeScript Contracts",
            order_index=1,
            documentation_url="https://www.typescriptlang.org/docs/",
            estimated_minutes=16,
            summary_md=(
                "Use TypeScript to make data contracts explicit and catch "
                "incorrect assumptions before runtime."
            ),
        )

        js_event_loop = get_or_create_concept(
            db,
            lesson_id=js_event_loop_lesson.id,
            name="JavaScript Event Loop",
            slug="javascript-event-loop",
            focus_points=[
                "call stack",
                "task queue",
                "microtasks",
                "non-blocking I/O",
            ],
        )

        js_promises = get_or_create_concept(
            db,
            lesson_id=js_promises_lesson.id,
            name="Promises and Async/Await",
            slug="javascript-promises-async-await",
            focus_points=[
                "Promise states",
                "await",
                "error propagation",
                "concurrency",
            ],
        )

        js_node = get_or_create_concept(
            db,
            lesson_id=js_node_lesson.id,
            name="Node.js HTTP Services",
            slug="javascript-node-http",
            focus_points=[
                "HTTP request lifecycle",
                "routing",
                "async I/O",
                "status codes",
            ],
        )

        js_types = get_or_create_concept(
            db,
            lesson_id=js_types_lesson.id,
            name="TypeScript Data Contracts",
            slug="javascript-typescript-contracts",
            focus_points=[
                "interfaces",
                "type aliases",
                "optional properties",
                "API response shapes",
            ],
        )

        get_or_create_question(
            db,
            concept_id=js_event_loop.id,
            question_type="predict",
            prompt_md="What usually runs before a regular task callback: a pending microtask or a later timer callback?",
            answer_format="mcq",
            grading_mode="deterministic",
            correct_answer_json={
                "options": [
                    "The timer always runs first",
                    "Pending microtasks are processed before the next task",
                    "They are random",
                    "Neither is scheduled",
                ],
                "correct_index": 1,
            },
        )

        get_or_create_question(
            db,
            concept_id=js_promises.id,
            question_type="recall",
            prompt_md="Where should you handle a rejection from an awaited promise inside an async function?",
            answer_format="mcq",
            grading_mode="deterministic",
            correct_answer_json={
                "options": [
                    "Only with console.log",
                    "With try/catch or by propagating the error",
                    "By converting it to JSON",
                    "It cannot reject",
                ],
                "correct_index": 1,
            },
        )

        get_or_create_question(
            db,
            concept_id=js_types.id,
            question_type="explain",
            prompt_md="Why are API response types useful even though TypeScript types are erased at runtime?",
            answer_format="free_text",
            grading_mode="ai_assisted",
        )

        js_concurrency_challenge = get_or_create_challenge(
            db,
            concept_id=js_promises.id,
            language_id=javascript.id,
            title="Limit Concurrent Promise Work",
            difficulty=3,
            description_md=(
                "Implement a small worker-pool helper that processes an array of "
                "async tasks with at most `limit` tasks running at once."
            ),
            learning_objectives=[
                "promise composition",
                "concurrency limiting",
                "async/await",
                "shared state coordination",
            ],
        )

        get_or_create_challenge_file(
            db,
            challenge_id=js_concurrency_challenge.id,
            path="solution.js",
            starter_content=(
                "export async function mapWithConcurrency(items, limit, worker) {\n"
                "  // TODO: process items while keeping at most `limit`\n"
                "  // worker calls in flight.\n"
                "}\n"
            ),
        )

        get_or_create_hint(
            db,
            challenge_id=js_concurrency_challenge.id,
            level=1,
            content_md=(
                "Think of `limit` as the number of worker slots. You need shared "
                "state that assigns the next item to an available slot."
            ),
        )

        get_or_create_hint(
            db,
            challenge_id=js_concurrency_challenge.id,
            level=2,
            content_md=(
                "A simple approach is to start `limit` async worker loops. Each "
                "loop pulls the next index and writes its result."
            ),
        )

        get_or_create_test_case(
            db,
            challenge_id=js_concurrency_challenge.id,
            name="Returns all items",
            order_index=1,
            expected_output_json={"contains": ["Promise"]},
        )

        get_or_create_test_case(
            db,
            challenge_id=js_concurrency_challenge.id,
            name="Respects concurrency",
            order_index=2,
            expected_output_json={"contains": ["limit"]},
            is_hidden=True,
        )

        # ===================================================================
        # JAVA CURRICULUM
        # ===================================================================

        java_core = get_or_create_module(
            db,
            language_id=java.id,
            title="Java Foundations",
            order_index=1,
        )

        java_oop = get_or_create_module(
            db,
            language_id=java.id,
            title="Object-Oriented Design",
            order_index=2,
        )

        java_backend = get_or_create_module(
            db,
            language_id=java.id,
            title="Java Backend",
            order_index=3,
        )

        java_collections_lesson = get_or_create_lesson(
            db,
            module_id=java_core.id,
            title="Collections & Generics",
            order_index=1,
            documentation_url="https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/package-summary.html",
            estimated_minutes=18,
            summary_md=(
                "Choose Java collections based on access patterns, mutability, "
                "ordering, and lookup requirements."
            ),
        )

        java_interfaces_lesson = get_or_create_lesson(
            db,
            module_id=java_oop.id,
            title="Interfaces & Composition",
            order_index=1,
            documentation_url="https://docs.oracle.com/javase/tutorial/java/IandI/",
            estimated_minutes=16,
            summary_md=(
                "Use interfaces to define behavior contracts and composition "
                "to avoid rigid inheritance hierarchies."
            ),
        )

        java_service_lesson = get_or_create_lesson(
            db,
            module_id=java_backend.id,
            title="Service-Layer Design",
            order_index=1,
            documentation_url="https://docs.spring.io/spring-framework/reference/",
            estimated_minutes=20,
            summary_md=(
                "Separate transport concerns from business behavior and keep "
                "services independently testable."
            ),
        )

        java_collections = get_or_create_concept(
            db,
            lesson_id=java_collections_lesson.id,
            name="Java Collections",
            slug="java-collections",
            focus_points=[
                "List vs Set vs Map",
                "lookup complexity",
                "generics",
                "mutability",
            ],
        )

        java_interfaces = get_or_create_concept(
            db,
            lesson_id=java_interfaces_lesson.id,
            name="Interfaces and Composition",
            slug="java-interfaces-composition",
            focus_points=[
                "contracts",
                "composition",
                "dependency inversion",
                "testability",
            ],
        )

        java_services = get_or_create_concept(
            db,
            lesson_id=java_service_lesson.id,
            name="Java Service Layer",
            slug="java-service-layer",
            focus_points=[
                "business logic",
                "controller-service boundaries",
                "dependency injection",
                "unit testing",
            ],
        )

        get_or_create_question(
            db,
            concept_id=java_collections.id,
            question_type="predict",
            prompt_md="Which collection is the natural choice when you need key-based lookup from an ID to an object?",
            answer_format="mcq",
            grading_mode="deterministic",
            correct_answer_json={
                "options": [
                    "ArrayList",
                    "HashMap",
                    "HashSet",
                    "Queue",
                ],
                "correct_index": 1,
            },
        )

        get_or_create_question(
            db,
            concept_id=java_interfaces.id,
            question_type="explain",
            prompt_md="Why can composition make a design easier to test than deep inheritance?",
            answer_format="free_text",
            grading_mode="ai_assisted",
        )

        # ===================================================================
        # PROJECTS
        # ===================================================================

        expense_tracker = get_or_create_project(
            db,
            language_id=python.id,
            title="Expense Tracker API",
            difficulty="beginner",
            requirements_md=(
                "Build a REST API for personal expenses. Support categories, "
                "pagination, date filtering, monthly summaries, and budget alerts. "
                "Use PostgreSQL persistence and structured validation."
            ),
        )

        for index, title in enumerate(
            [
                "Data model + database migration",
                "CRUD endpoints for expenses",
                "Category filtering + pagination",
                "Monthly summary aggregation",
                "Budget alert logic",
                "Authentication + authorization",
                "Integration tests",
            ],
            start=1,
        ):
            get_or_create_milestone(
                db,
                project_id=expense_tracker.id,
                title=title,
                order_index=index,
            )

        url_shortener = get_or_create_project(
            db,
            language_id=python.id,
            title="Production URL Shortener",
            difficulty="intermediate",
            requirements_md=(
                "Build a URL-shortening service with collision-resistant codes, "
                "Redis-backed redirects, click analytics, expiration, rate limiting, "
                "and observability."
            ),
        )

        for index, title in enumerate(
            [
                "URL data model + migrations",
                "Short-code generation",
                "Create + redirect endpoints",
                "Redis caching",
                "Click analytics",
                "Rate limiting",
                "Expiration + cleanup",
                "Load testing",
            ],
            start=1,
        ):
            get_or_create_milestone(
                db,
                project_id=url_shortener.id,
                title=title,
                order_index=index,
            )

        movie_reservation = get_or_create_project(
            db,
            language_id=java.id,
            title="Concurrent Movie Reservation System",
            difficulty="advanced",
            requirements_md=(
                "Design a reservation service where multiple users may attempt "
                "to book the same seat simultaneously. Prevent double booking "
                "and make booking/cancellation behavior transactional."
            ),
        )

        for index, title in enumerate(
            [
                "Domain model + migrations",
                "Seat availability queries",
                "Reservation transaction",
                "Concurrency-safe seat locking",
                "Booking + cancellation flow",
                "Failure recovery",
                "Integration tests",
                "Race-condition load test",
            ],
            start=1,
        ):
            get_or_create_milestone(
                db,
                project_id=movie_reservation.id,
                title=title,
                order_index=index,
            )

        node_api = get_or_create_project(
            db,
            language_id=javascript.id,
            title="Node.js Event Processing API",
            difficulty="intermediate",
            requirements_md=(
                "Build an API that accepts events, validates payloads, processes "
                "them asynchronously, exposes processing status, and retries "
                "transient failures without creating duplicate work."
            ),
        )

        for index, title in enumerate(
            [
                "Event schema + validation",
                "HTTP ingestion endpoint",
                "Async processing pipeline",
                "Idempotency keys",
                "Retry and dead-letter handling",
                "Status endpoint",
                "Observability",
                "Load testing",
            ],
            start=1,
        ):
            get_or_create_milestone(
                db,
                project_id=node_api.id,
                title=title,
                order_index=index,
            )

        # ===================================================================
        # PRODUCTION LAB INCIDENTS
        # ===================================================================

        get_or_create_incident(
            db,
            title="API Latency Spike Under Load",
            difficulty=2,
            metrics_fixture_json={
                "api_latency": {
                    "from": "120ms",
                    "to": "4.7s",
                    "severity": "critical",
                },
                "error_rate": {
                    "from": "0.4%",
                    "to": "5.1%",
                    "severity": "critical",
                },
                "database_cpu": {
                    "from": "12%",
                    "to": "94%",
                    "severity": "critical",
                },
                "redis": {
                    "from": "Normal",
                    "to": "Normal",
                    "severity": "normal",
                },
            },
            logs_fixture_json={
                "lines": [
                    "12:03:41 WARN slow query detected: SELECT * FROM orders WHERE ... (3400ms)",
                    "12:03:44 WARN connection pool exhausted, waiting for available connection",
                    "12:03:52 ERROR request timeout after 5000ms — GET /api/orders",
                ]
            },
            root_cause_md=(
                "An unindexed orders query became slower as the table grew. "
                "Slow requests held database connections for too long, exhausted "
                "the connection pool, and caused a cascade of request timeouts."
            ),
            diagnosis_grading_json={
                "keywords": [
                    "index",
                    "slow query",
                    "connection pool",
                ]
            },
        )

        get_or_create_incident(
            db,
            title="Retry Storm Causes Downstream Outage",
            difficulty=3,
            metrics_fixture_json={
                "request_rate": {
                    "from": "900/min",
                    "to": "3200/min",
                    "severity": "critical",
                },
                "downstream_latency": {
                    "from": "180ms",
                    "to": "2900ms",
                    "severity": "critical",
                },
                "error_rate": {
                    "from": "0.8%",
                    "to": "18%",
                    "severity": "critical",
                },
                "queue_depth": {
                    "from": "120",
                    "to": "9400",
                    "severity": "warning",
                },
            },
            logs_fixture_json={
                "lines": [
                    "09:14:03 WARN downstream returned 503",
                    "09:14:03 WARN retry attempt 1/5 scheduled",
                    "09:14:04 WARN downstream returned 503",
                    "09:14:04 WARN retry attempt 2/5 scheduled",
                    "09:14:05 ERROR queue depth exceeded 9000",
                ]
            },
            root_cause_md=(
                "The client retried downstream failures too aggressively. "
                "Retries increased traffic during an outage, amplifying load and "
                "creating a retry storm that overwhelmed both the downstream "
                "service and the processing queue."
            ),
            diagnosis_grading_json={
                "keywords": [
                    "retry storm",
                    "exponential backoff",
                    "jitter",
                    "downstream",
                ]
            },
        )

        get_or_create_incident(
            db,
            title="Authentication Failure After Secret Rotation",
            difficulty=2,
            metrics_fixture_json={
                "auth_success_rate": {
                    "from": "99.3%",
                    "to": "61.2%",
                    "severity": "critical",
                },
                "token_verification_errors": {
                    "from": "0.2%",
                    "to": "37.8%",
                    "severity": "critical",
                },
                "database_cpu": {
                    "from": "22%",
                    "to": "23%",
                    "severity": "normal",
                },
            },
            logs_fixture_json={
                "lines": [
                    "15:40:01 INFO secret rotation completed",
                    "15:40:07 WARN invalid token signature",
                    "15:40:09 WARN invalid token signature",
                    "15:40:12 ERROR authentication middleware rejected token",
                ]
            },
            root_cause_md=(
                "The signing secret was rotated in one environment while existing "
                "tokens were still being verified against the old key. Without a "
                "key transition strategy, currently valid sessions became invalid."
            ),
            diagnosis_grading_json={
                "keywords": [
                    "secret rotation",
                    "jwt",
                    "signing key",
                    "token",
                ]
            },
        )

        # ===================================================================
        # COMMIT
        # ===================================================================

        db.commit()

        print("FORGE database seed complete.")
        print("Languages: Python, JavaScript, Java")
        print("Starter curriculum, challenges, projects, and incidents loaded.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()
