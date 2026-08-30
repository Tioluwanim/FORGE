# FORGE — Backend

FastAPI backend implementing Phases 1-5 of `forge-architecture-plan.md`:
auth, tracks, curriculum, questions, challenges, projects, mastery/progress,
reviews, the debugging lab, a real AI Mentor integration, and — as of Phase
5 — **real sandboxed code execution**: a Redis-backed job queue, a separate
worker process, and an actual Docker-isolated runner with network
disabled, resource limits, a non-root user, and a read-only root filesystem.

**Read `app/submissions/sandbox_image/BUILD.md` before deploying this.**
Real code execution will not run as-is on Render's standard services —
they don't expose a Docker daemon. That file explains why and gives three
concrete options.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # then fill in SECRET_KEY at minimum

docker compose up -d   # postgres + redis + a local worker (for testing execution)

alembic revision --autogenerate -m "initial schema"
alembic upgrade head

python -m scripts.seed   # populates real starter content, including two
                          # challenges with real (not heuristic) test harnesses

uvicorn app.main:app --reload
```

In a second terminal, run the worker (only needed if you're testing real
execution — see below):

```bash
docker build -t forge-python-sandbox:latest -f app/submissions/sandbox_image/Dockerfile app/submissions/sandbox_image
python -m app.submissions.worker
```

Then open http://localhost:8000/docs for the interactive API explorer.

> **This has not been run in the sandbox that generated it** — same caveat
> as always, `pip install` is blocked in this environment. What I *could*
> do: extract the exact test-harness strings from `scripts/seed.py` and
> actually execute them locally (via plain `subprocess`, no Docker) against
> both correct and deliberately broken solutions, to verify the harness
> logic and result-parsing are correct. That caught two real bugs before
> they shipped — see the comments in `scripts/seed.py` around
> `n_plus_one_harness` for what they were (the `Order`/`Customer` classes
> weren't reachable from the learner's code, and the starter code's own
> `db: Session` type hint would have crashed at import time for every
> learner). The Docker-specific parts (`docker_client.py`,
> `python_runner.py`'s container calls) are correct against the `docker-py`
> API as documented, but genuinely untested end-to-end since there's no
> Docker daemon in this environment.

## What's real

- **Auth** — signup/login with Argon2 password hashing, JWT bearer tokens. OAuth endpoints exist but correctly return `501` until you add real Google/GitHub client credentials.
- **Tracks** — per-language progress isolation.
- **Curriculum** — modules → lessons → concepts, with a real roadmap status algorithm (`app/curriculum/roadmap_service.py`) that derives mastered/learning/weak/locked/recommended/review_required from actual mastery snapshots and prerequisites.
- **Mastery** — computed from raw `Attempt` rows via `app/mastery/service.py`.
- **AI Mentor** — a real Groq API integration with the AI Tutor Rules from spec §18 baked into its system prompt. Returns a clear `501` if `GROQ_API_KEY` isn't set.
- **Debugging Lab** — real fixture data, deterministic keyword-based diagnosis grading.
- **Reviews** — real spaced-repetition stage advancement (day0→2→7→21→45).
- **System Design Lab** — canvas state persists per-user, with real rule-based architecture validation.
- **Settings** — profile, preferences, and password change are all real.
- **Code execution (Phase 5, new)** — `POST /submissions/challenges/{id}` enqueues a job and returns `202` immediately; `GET /submissions/{id}` polls for the result. The worker (`app/submissions/worker.py`, a separate process) picks the job up and, when `SANDBOX_ENABLED=true`, runs the learner's code inside an isolated Docker container (`app/submissions/runners/python_runner.py`): network disabled, CPU/memory/pids capped, non-root user, read-only root filesystem, tmpfs scratch space, all capabilities dropped, wall-clock timeout enforced from outside the container. Two seeded challenges (`async-retry`, `n-plus-one`) have real `test_harness_code` that actually imports and calls the submitted function.

## What's explicitly stubbed, and why

- **The default execution path is still the heuristic grader** (`SANDBOX_ENABLED=false` by default, in `app/submissions/sandbox.py`). Real execution only activates once you've set up a Docker-capable host and pointed `DOCKER_HOST` at it — see `sandbox_image/BUILD.md`. The app keeps working today either way; you opt into real execution when the infrastructure exists.
- **OAuth** — `/auth/oauth/{provider}/authorize` returns 501 until you register real Google/GitHub apps.
- **Mastery recompute and review scheduling** still run synchronously inline rather than as background jobs.

## Structure

Matches `forge-architecture-plan.md` §2.1 — one directory per bounded module.
`app/submissions/` is the security-critical one: `sandbox.py` is the
dispatch point, `runners/` holds the language-agnostic execution interface
(`base.py`, per spec §55) and the real Docker implementation
(`python_runner.py`), `docker_client.py` handles local vs. remote Docker
connections, `queue.py`/`tasks.py`/`worker.py` are the async job pipeline,
and `sandbox_image/` is the actual container image + the deployment guide.

## Deploying the worker on Render

`render.yaml` provisions both the web service and a background worker.
Leave `SANDBOX_ENABLED=false` until you've set up a Docker host per
`sandbox_image/BUILD.md` — the worker runs fine on Render either way; it
just falls back to the heuristic grader without a reachable Docker daemon.
