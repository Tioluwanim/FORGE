from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.uuid_utils import ensure_uuid
from app.db.models_identity import User
from app.db.models_platform import Incident, UserIncident
from app.db.session import get_db

router = APIRouter(prefix="/incidents", tags=["production_labs"])


class IncidentSummary(BaseModel):
    id: str
    title: str
    difficulty: int


class IncidentDetail(BaseModel):
    id: str
    title: str
    metrics: dict
    logs: dict


class DiagnosisRequest(BaseModel):
    diagnosis_md: str


class DiagnosisResult(BaseModel):
    is_correct: bool
    root_cause_md: str


@router.get("", response_model=list[IncidentSummary])
def list_incidents(db: Session = Depends(get_db)) -> list[IncidentSummary]:
    incidents = db.query(Incident).all()
    return [IncidentSummary(id=i.id, title=i.title, difficulty=i.difficulty) for i in incidents]


@router.get("/{incident_id}", response_model=IncidentDetail)
def get_incident(incident_id: str, db: Session = Depends(get_db)) -> IncidentDetail:
    incident_id = ensure_uuid(incident_id)
    incident = db.get(Incident, incident_id)
    if incident is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Incident not found")
    return IncidentDetail(
        id=incident.id, title=incident.title, metrics=incident.metrics_fixture_json, logs=incident.logs_fixture_json
    )


@router.post("/{incident_id}/diagnose", response_model=DiagnosisResult)
def submit_diagnosis(
    incident_id: str,
    payload: DiagnosisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DiagnosisResult:
    incident_id = ensure_uuid(incident_id)
    incident = db.get(Incident, incident_id)
    if incident is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Incident not found")

    # Deterministic keyword grading against diagnosis_grading_json — no AI
    # call needed for something this checkable. Falls back to "needs manual
    # review" (is_correct=False, shown alongside the real root cause) when
    # the grading fixture doesn't specify a keyword set.
    keywords = (incident.diagnosis_grading_json or {}).get("keywords", [])
    is_correct = bool(keywords) and any(kw.lower() in payload.diagnosis_md.lower() for kw in keywords)

    db.add(
        UserIncident(
            user_id=current_user.id,
            incident_id=incident.id,
            status="completed",
            diagnosis_submitted_md=payload.diagnosis_md,
            is_correct=is_correct,
            completed_at=datetime.now(timezone.utc),
        )
    )
    db.commit()

    return DiagnosisResult(is_correct=is_correct, root_cause_md=incident.root_cause_md)
