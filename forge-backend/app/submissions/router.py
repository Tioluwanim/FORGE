import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.uuid_utils import ensure_uuid
from app.db.models_challenges import Challenge, Submission, SubmissionStatus
from app.db.models_identity import Track, User
from app.db.session import get_db
from app.submissions.queue import submission_queue
from app.submissions.schemas import (
    SubmissionCreateRequest,
    SubmissionResponse,
    SubmissionResultResponse,
    TestCaseResult,
)
from app.submissions.tasks import execute_submission_job

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("/challenges/{challenge_id}", response_model=SubmissionResponse, status_code=status.HTTP_202_ACCEPTED)
def submit_challenge(
    challenge_id: str,
    payload: SubmissionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubmissionResponse:
    """
    Enqueues a submission and returns immediately — this is a queue, not a
    synchronous execution call (forge-architecture-plan.md §2.3). The
    worker that actually runs the code may be on a completely different
    machine (see sandbox_image/BUILD.md); the API process never talks to
    Docker directly. Poll GET /submissions/{id} for the result.
    """
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
        status=SubmissionStatus.queued,
        submitted_code_ref=json.dumps(payload.files),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    submission_queue.enqueue(execute_submission_job, submission.id, job_id=submission.id)

    return SubmissionResponse(id=submission.id, status=submission.status.value)


@router.get("/{submission_id}", response_model=SubmissionResultResponse)
def get_submission(
    submission_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubmissionResultResponse:
    """Poll this until status is no longer 'queued' or 'running'."""
    submission_id = ensure_uuid(submission_id)
    submission = db.get(Submission, submission_id)
    if submission is None or submission.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Submission not found")

    if submission.result is None:
        return SubmissionResultResponse(
            id=submission.id,
            status=submission.status.value,
            tests_passed=0,
            tests_total=0,
            duration_ms=0,
            results=[],
        )

    result = submission.result
    test_results = (result.test_result_json or {}).get("results", [])
    mode = (result.test_result_json or {}).get("mode")

    return SubmissionResultResponse(
        id=submission.id,
        status=submission.status.value,
        tests_passed=result.tests_passed,
        tests_total=result.tests_total,
        duration_ms=result.duration_ms,
        results=[TestCaseResult(**r) for r in test_results],
        mode=mode,
    )
