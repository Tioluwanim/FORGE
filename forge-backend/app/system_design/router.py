from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.models_identity import User
from app.db.models_platform import SystemDesignAttempt
from app.db.session import get_db

router = APIRouter(prefix="/system-design", tags=["system_design"])


class CanvasNode(BaseModel):
    id: str
    type: str
    x: float
    y: float


class SaveAttemptRequest(BaseModel):
    scenario_id: str = "rate-limited-api"
    nodes: list[CanvasNode]


class ValidationIssue(BaseModel):
    message: str
    severity: str = "warn"


class AttemptResponse(BaseModel):
    id: str
    scenario_id: str
    nodes: list[CanvasNode]
    issues: list[ValidationIssue]


def _validate(nodes: list[CanvasNode]) -> list[ValidationIssue]:
    """
    Deterministic architecture checks — deliberately simple, rule-based
    reasoning rather than an LLM call, since these are checkable facts about
    relative node placement (spec §22: "the system validates architecture
    decisions"). Add rules here as new scenarios need them.
    """
    issues: list[ValidationIssue] = []
    by_type = {n.type: n for n in nodes}

    worker = by_type.get("worker")
    lb = by_type.get("load_balancer")
    queue = by_type.get("queue")
    if worker and lb and abs(worker.y - lb.y) < 40 and worker.x > lb.x and not queue:
        issues.append(
            ValidationIssue(
                message="You've placed the worker directly behind the load balancer with no queue. "
                "Workers usually consume from a queue, not client traffic directly.",
                severity="warn",
            )
        )

    api = by_type.get("api")
    database = by_type.get("database")
    cache = by_type.get("cache")
    if api and database and not cache:
        issues.append(
            ValidationIssue(
                message="No cache between the API and the database — every read will hit "
                "Postgres directly. Consider whether a cache belongs here.",
                severity="info",
            )
        )

    return issues


@router.post("/attempts", response_model=AttemptResponse)
def save_attempt(
    payload: SaveAttemptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AttemptResponse:
    issues = _validate(payload.nodes)

    attempt = SystemDesignAttempt(
        user_id=current_user.id,
        scenario_id=payload.scenario_id,
        canvas_state_json={"nodes": [n.model_dump() for n in payload.nodes]},
        validation_result_json={"issues": [i.model_dump() for i in issues]},
        completed_at=datetime.now(timezone.utc) if not issues else None,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return AttemptResponse(id=attempt.id, scenario_id=attempt.scenario_id, nodes=payload.nodes, issues=issues)


@router.get("/attempts/latest", response_model=AttemptResponse | None)
def latest_attempt(
    scenario_id: str = "rate-limited-api",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AttemptResponse | None:
    attempt = (
        db.query(SystemDesignAttempt)
        .filter(SystemDesignAttempt.user_id == current_user.id, SystemDesignAttempt.scenario_id == scenario_id)
        .order_by(SystemDesignAttempt.id.desc())
        .first()
    )
    if attempt is None:
        return None

    nodes = [CanvasNode(**n) for n in attempt.canvas_state_json.get("nodes", [])]
    issues = [ValidationIssue(**i) for i in (attempt.validation_result_json or {}).get("issues", [])]
    return AttemptResponse(id=attempt.id, scenario_id=attempt.scenario_id, nodes=nodes, issues=issues)
