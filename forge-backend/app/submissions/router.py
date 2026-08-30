from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.uuid_utils import ensure_uuid
from app.db.models_challenges import Challenge, ExecutionResult, Submission, SubmissionStatus, TestCase
from app.db.models_identity import Track, User
from app.db.models_progress import Attempt, AttemptKind, AttemptResult
from app.db.session import get_db
from app.mastery.service import recompute_mastery_for_user
from app.submissions.sandbox import grade_submission_dev_only
from app.submissions.schemas import (
    SubmissionCreateRequest,
    SubmissionResultResponse,
    TestCaseResult,
)

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("/challenges/{challenge_id}", response_model=SubmissionResultResponse)
def submit_challenge(
    challenge_id: str,
    payload: SubmissionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubmissionResultResponse:
    challenge_id = ensure_uuid(challenge_id)
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Challenge not found")

    track = db.get(Track, ensure_uuid(payload.track_id))
    if track is None or track.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Track not found")

    submission = Submission(
        user_id=current_user.id,
        challenge_id=challenge.id,
        track_id=track.id,
        status=SubmissionStatus.running,
    )
    db.add(submission)
    db.flush()

    # NOTE: this calls the dev-only heuristic grader (see submissions/sandbox.py's
    # module docstring) — it does not execute the submitted code. Swap for
    # `enqueue_execution_job` + polling once the real sandbox worker exists.
    test_cases = db.query(TestCase).filter(TestCase.challenge_id == challenge.id).order_by(TestCase.order_index).all()
    hints = [
        {
            "name": tc.name,
            "hidden": tc.is_hidden,
            "check": (tc.expected_output_json or {}).get("contains", []),
        }
        for tc in test_cases
    ]
    outcome = grade_submission_dev_only(payload.files, hints)

    all_passed = outcome["tests_passed"] == outcome["tests_total"] and outcome["tests_total"] > 0
    submission.status = SubmissionStatus.passed if all_passed else SubmissionStatus.failed
    submission.completed_at = datetime.now(timezone.utc)

    total_duration = sum(r["duration_ms"] for r in outcome["results"])
    result_row = ExecutionResult(
        submission_id=submission.id,
        tests_passed=outcome["tests_passed"],
        tests_total=outcome["tests_total"],
        duration_ms=total_duration,
        memory_used_mb=0,
        test_result_json=outcome,
    )
    db.add(result_row)

    # Record the raw signal for the mastery pipeline (plan §4.5/§23) — the
    # mastery_snapshots recompute worker consumes this; we never write mastery
    # percentages directly from a request handler.
    db.add(
        Attempt(
            user_id=current_user.id,
            challenge_id=challenge.id,
            concept_id=challenge.concept_id,
            kind=AttemptKind.challenge,
            result=AttemptResult.pass_ if all_passed else AttemptResult.fail,
            duration_ms=total_duration,
        )
    )

    db.commit()

    # Dev-mode synchronous recompute — see mastery/service.py's docstring for
    # why this should become an async worker job before real traffic hits it.
    if challenge.concept_id:
        recompute_mastery_for_user(db, user_id=current_user.id, track_id=track.id)

    return SubmissionResultResponse(
        id=submission.id,
        status=submission.status.value,
        tests_passed=outcome["tests_passed"],
        tests_total=outcome["tests_total"],
        duration_ms=total_duration,
        results=[TestCaseResult(**r) for r in outcome["results"]],
    )
