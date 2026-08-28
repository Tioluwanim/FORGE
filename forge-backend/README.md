# FORGE — Backend

FastAPI backend implementing Phases 1-4 of `forge-architecture-plan.md`:
auth, tracks, curriculum, questions, challenges, projects, mastery/progress,
reviews, and the debugging lab — plus a real AI Mentor integration. Phase 5
(the actual sandboxed code-execution worker) is explicitly **not** built —
see `app/submissions/sandbox.py`'s docstring for why, and what to build.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # then fill in SECRET_KEY at minimum

docker compose up -d   # postgres + redis

alembic revision --autogenerate -m "initial schema"
alembic upgrade head

python -m scripts.seed   # populates real starter content

uvicorn app.main:app --reload
```

Then open http://localhost:8000/docs for the interactive API explorer.

> **This has not been run in the sandbox that generated it.** `pip install`
> was blocked there the same way `npm install` was for the frontend
> (registry access returned 403 despite being an allowed host). Every file
> was hand-written and syntax-checked with `py_compile`, and the trickier
> pieces (SQLAlchemy 2.0 `Mapped[...]` relationship typing, Alembic's
> autogenerate wiring) were written carefully, but budget time to fix
> whatever `alembic revision --autogenerate` and the first `uvicorn` boot
> surface — model relationship typos are the most likely culprit if
> anything breaks.

## What's real

- **Auth** — signup/login with Argon2 password hashing, JWT bearer tokens. OAuth endpoints exist but correctly return `501` until you add real Google/GitHub client credentials (`app/auth/router.py`'s docstring explains why this isn't stubbed further).
- **Tracks** — per-language progress isolation, exactly matching the frontend's Python 72% / JS 34% / Java "not started" display.
- **Curriculum** — modules → lessons → concepts, with a real roadmap status algorithm (`app/curriculum/roadmap_service.py`) that derives mastered/learning/weak/locked/recommended/review_required from actual mastery snapshots and prerequisites — not hardcoded per spec §51 ("never confuse activity with learning").
- **Mastery** — computed from raw `Attempt` rows via `app/mastery/service.py`, matching the architecture plan's derived-snapshot design (§23). Recomputed synchronously after each submission for now; should move to a background worker before real traffic (see that file's docstring).
- **AI Mentor** — a real Anthropic API integration (`app/ai/service.py`) with a system prompt encoding the AI Tutor Rules from spec §18 (hints before answers, never claim tests passed, distinguish syntax from architectural mistakes). Returns a clear `501` if `ANTHROPIC_API_KEY` isn't set — it does not fake a response.
- **Debugging Lab** — incident metrics/logs are real fixture data, diagnosis grading is deterministic keyword matching.
- **Reviews** — real spaced-repetition stage advancement (day0→2→7→21→45).
- **System Design Lab** — canvas state persists per-user, with real (rule-based, not LLM) architecture validation in `app/system_design/router.py`.
- **Settings** — profile (display name/bio/goal), preferences (reduced motion/email digest/review reminders, stored as JSON on the profile), and password change are all real.

## What's explicitly stubbed, and why

- **Code execution** (`app/submissions/sandbox.py`) — does not execute learner code at all. It does heuristic substring-matching against submitted source so the rest of the product has real data to render, and is loud about being non-executing in its own docstring and return payload. Building the real thing (ephemeral Docker containers, network isolation, resource limits) needs container infrastructure this repo doesn't provision — see `forge-architecture-plan.md` §7 for the actual design when you're ready to build it. **Do not "simplify" this by adding `exec()` or `subprocess.run()` on raw submitted code** — that's the exact vulnerability the isolation boundary exists to prevent.
- **OAuth** — `/auth/oauth/{provider}/authorize` returns 501 until you register real Google/GitHub apps and implement the authorization-code exchange.
- **Background workers** — mastery recompute and review scheduling run synchronously inline for now. `requirements.txt` includes Celery/Redis for when that changes.

## Structure

Matches `forge-architecture-plan.md` §2.1 — one directory per bounded module
(`auth`, `tracks`, `curriculum`, `challenges`, `submissions`, `projects`,
`mastery`, `progress`, `reviews`, `production_labs`, `ai`), each owning its
own router/schemas/service. `app/db/` holds every SQLAlchemy model, split
into files by the schema groupings from the plan's §4 but all sharing one
`Base` so Alembic autogenerate sees the whole picture via `app/db/models.py`.

## Next step

The frontend (`forge-frontend`) is now fully wired to every endpoint here except `/production` (deliberately left as a client-only simulation — see its own README). Point it at this backend by setting `NEXT_PUBLIC_API_URL` in the frontend's `.env.local`, run both, and the seed data should render end to end.
