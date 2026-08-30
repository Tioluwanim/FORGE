"""
The job body an RQ worker actually executes. Kept separate from the router
so the router's job is only "validate the request and enqueue it" — the
worker process (a completely separate Python process, possibly on a
completely separate machine) is what talks to Docker.
"""

from datetime import datetime, timezone

from app.core.config import get_settings
from app.db.models_challenges import Challenge, ExecutionResult, Submission, SubmissionStatus, TestCase
from app.db.models_progress import Attempt, AttemptKind, AttemptResult
from app.db.session import SessionLocal
from app.mastery.service import recompute_mastery_for_user
from app.submissions.sandbox import grade_submission

settings = get_settings()


def execute_submission_job(submission_id: str) -> None:
    """
    Entry point RQ calls in the worker process. Deliberately opens its own
    DB session (SessionLocal, not a request-scoped `get_db()` dependency —
    this isn't running inside a FastAPI request) and commits its own
    transaction, since by the time this runs, the original HTTP request that
    enqueued it has already returned.
    """
    db = SessionLocal()
    try:
        submission = db.get(Submission, submission_id)
        if submission is None:
            return  # submission was deleted between enqueue and dequeue — nothing to do

        challenge = db.get(Challenge, submission.challenge_id)
        if challenge is None:
            submission.status = SubmissionStatus.error
            db.commit()
            return

        files = _load_submitted_files(submission)
        test_cases = (
            db.query(TestCase).filter(TestCase.challenge_id == challenge.id).order_by(TestCase.order_index).all()
        )

        outcome = grade_submission(challenge=challenge, files=files, test_cases=test_cases)

        all_passed = outcome["tests_passed"] == outcome["tests_total"] and outcome["tests_total"] > 0
        submission.status = SubmissionStatus.passed if all_passed else SubmissionStatus.failed
        submission.completed_at = datetime.now(timezone.utc)

        db.add(
            ExecutionResult(
                submission_id=submission.id,
                tests_passed=outcome["tests_passed"],
                tests_total=outcome["tests_total"],
                duration_ms=outcome["duration_ms"],
                memory_used_mb=0,
                stdout_ref=outcome.get("stdout"),
                stderr_ref=outcome.get("stderr"),
                test_result_json=outcome,
            )
        )

        db.add(
            Attempt(
                user_id=submission.user_id,
                challenge_id=challenge.id,
                concept_id=challenge.concept_id,
                kind=AttemptKind.challenge,
                result=AttemptResult.pass_ if all_passed else AttemptResult.fail,
                duration_ms=outcome["duration_ms"],
            )
        )

        db.commit()

        if challenge.concept_id:
            recompute_mastery_for_user(db, user_id=submission.user_id, track_id=submission.track_id)

    except Exception as e:  # noqa: BLE001
        db.rollback()
        submission = db.get(Submission, submission_id)
        if submission:
            submission.status = SubmissionStatus.error
            db.add(
                ExecutionResult(
                    submission_id=submission.id,
                    tests_passed=0,
                    tests_total=0,
                    test_result_json={"error": str(e)},
                )
            )
            db.commit()
        raise
    finally:
        db.close()


def _load_submitted_files(submission: Submission) -> dict[str, str]:
    """
    `submission.submitted_code_ref` is a JSON-encoded {path: content} dict —
    see the note in submissions/router.py about why it's stored this way
    rather than as separate object-storage blobs for now.
    """
    import json

    if not submission.submitted_code_ref:
        return {}
    return json.loads(submission.submitted_code_ref)
