"""
Execution boundary for learner submissions.

⚠️  READ BEFORE TOUCHING THIS FILE.

This module intentionally does NOT execute submitted code. Real sandboxed
execution (ephemeral Docker containers, no network, resource limits, a
worker process with no access to app secrets) is Phase 5 work — see
forge-architecture-plan.md §7 for the full design. Building that safely
needs real infrastructure (a container runtime, a queue, a worker fleet)
that doesn't exist in this repo yet, and faking "it's sandboxed" here would
be actively dangerous if this code ever ran anywhere near production.

So instead: `grade_submission_dev_only()` below never runs the learner's
code. It does simple, transparent heuristic checks against the submitted
source text (does it contain a `try/except`, does it call the expected
function, etc.) purely so the rest of the product — the challenge page,
the results page, mastery updates — has something real to react to during
Phase 1-4 development. It is loud about what it is in its own return
payload and refuses to run at all if `settings.sandbox_enabled` is set,
so nobody mistakes it for the real thing in a deployed environment.

When Phase 5 arrives, replace the body of `grade_submission_dev_only`
with a call to `enqueue_execution_job()` (stubbed below) and implement
the actual worker per the architecture plan. Don't patch this file to
"just run `exec()`" as a shortcut — that is exactly the vulnerability
§14/§39 exist to prevent.
"""

import time

from app.core.config import get_settings

settings = get_settings()


class SandboxNotConfiguredError(RuntimeError):
    pass


def grade_submission_dev_only(
    files: dict[str, str], test_case_hints: list[dict]
) -> dict:
    """
    Heuristic, non-executing grading for local development only.

    `test_case_hints` is a list of {"name": str, "check": str} where `check`
    is a substring (or small set of substrings, any-match) the source must
    contain for that test to be considered "passed". This is deliberately
    dumb — it is not a replacement for running tests, only a stand-in so the
    UI has real submission data to render while the real sandbox is built.
    """
    if settings.sandbox_enabled:
        raise SandboxNotConfiguredError(
            "sandbox_enabled=True but no real execution backend is wired up. "
            "Implement enqueue_execution_job() before enabling this flag."
        )

    combined_source = "\n".join(files.values())
    results = []
    for case in test_case_hints:
        checks = case["check"] if isinstance(case["check"], list) else [case["check"]]
        passed = any(c in combined_source for c in checks)
        results.append(
            {
                "name": case["name"],
                "passed": passed,
                "duration_ms": int(5 + 15 * time.time() % 1),
                "message": None if passed else f"Expected source to contain one of: {checks}",
                "hidden": case.get("hidden", False),
            }
        )
    return {
        "mode": "dev_heuristic_no_execution",
        "results": results,
        "tests_passed": sum(1 for r in results if r["passed"]),
        "tests_total": len(results),
    }


def enqueue_execution_job(submission_id: str, files: dict[str, str]) -> None:
    """
    Real entrypoint for Phase 5. Should push a job onto the queue (Redis
    Streams / Celery — see architecture plan §7.2) for a worker to pick up,
    run inside an ephemeral, network-isolated, resource-limited container,
    and write a structured result back. Not implemented here on purpose.
    """
    raise NotImplementedError(
        "Real sandboxed execution isn't implemented yet — see this file's "
        "module docstring and forge-architecture-plan.md §7."
    )
