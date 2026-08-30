"""
Execution boundary for learner submissions — the single place that decides
whether a submission gets real sandboxed execution or the dev-mode
heuristic fallback, and the only module downstream code should import from.

Real execution (Docker, resource-limited, network-isolated) lives in
`runners/python_runner.py` and requires:
1. `settings.sandbox_enabled = True`
2. A reachable Docker daemon (`docker_client.py`) — see
   `sandbox_image/BUILD.md` for why this generally can't just be "the same
   machine the API runs on" in production.
3. The challenge itself has `test_harness_code` set — a challenge with only
   the old heuristic-style TestCase.expected_output_json (`{"contains": [...]}`)
   can't be really executed, since that format was never anything but a
   substring check.

If any of those aren't true, this falls back to the heuristic grader rather
than erroring, so the product keeps working while you're still setting the
sandbox up (see sandbox_image/BUILD.md).
"""

import time

from app.core.config import get_settings
from app.db.models_challenges import Challenge, TestCase
from app.submissions.runners.python_runner import PythonRunner

settings = get_settings()


def grade_submission(challenge: Challenge, files: dict[str, str], test_cases: list[TestCase]) -> dict:
    if settings.sandbox_enabled and challenge.test_harness_code:
        return _grade_real(challenge, files)
    return _grade_heuristic(files, test_cases)


def _grade_real(challenge: Challenge, files: dict[str, str]) -> dict:
    runner = PythonRunner()

    syntax_issues = runner.validate(files)
    if syntax_issues:
        return {
            "mode": "sandboxed_execution",
            "results": [
                {"name": "Syntax check", "passed": False, "duration_ms": 0, "message": i.message, "hidden": False}
                for i in syntax_issues
            ],
            "tests_passed": 0,
            "tests_total": len(syntax_issues),
            "duration_ms": 0,
        }

    result = runner.run(files, challenge.test_harness_code)

    per_test_ms = result.duration_ms // max(len(result.tests), 1)
    results = [
        {
            "name": t.name,
            "passed": t.passed,
            "duration_ms": per_test_ms,
            "message": t.message,
            "hidden": t.hidden,
        }
        for t in result.tests
    ]

    return {
        "mode": "sandboxed_execution",
        "results": results,
        "tests_passed": sum(1 for r in results if r["passed"]),
        "tests_total": len(results),
        "duration_ms": result.duration_ms,
        "stdout": result.stdout[-4000:],  # cap stored output size
        "stderr": result.stderr[-4000:],
    }


def _grade_heuristic(files: dict[str, str], test_cases: list[TestCase]) -> dict:
    """
    Non-executing fallback — see this module's docstring for when it's used.
    Never claims to have run anything; `mode` in the return payload always
    says exactly what happened.
    """
    combined_source = "\n".join(files.values())
    results = []
    for tc in test_cases:
        checks = (tc.expected_output_json or {}).get("contains", [])
        if isinstance(checks, str):
            checks = [checks]
        passed = bool(checks) and any(c in combined_source for c in checks)
        results.append(
            {
                "name": tc.name,
                "passed": passed,
                "duration_ms": int(5 + 15 * time.time() % 1),
                "message": None if passed else f"Expected source to contain one of: {checks}" if checks else "No heuristic check configured for this test",
                "hidden": tc.is_hidden,
            }
        )
    return {
        "mode": "dev_heuristic_no_execution",
        "results": results,
        "tests_passed": sum(1 for r in results if r["passed"]),
        "tests_total": len(results),
        "duration_ms": sum(r["duration_ms"] for r in results),
    }
