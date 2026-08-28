from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.models_curriculum import Concept
from app.db.models_identity import User
from app.db.models_progress import MasterySnapshot
from app.db.session import get_db
from app.progress.schemas import DashboardResponse, MasteryBreakdown, WeakArea

router = APIRouter(tags=["progress"])

WEAK_THRESHOLD = 65


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> DashboardResponse:
    snapshots = (
        db.query(MasterySnapshot)
        .filter(MasterySnapshot.user_id == current_user.id)
        .all()
    )

    weak = sorted(
        [s for s in snapshots if float(s.overall_pct) < WEAK_THRESHOLD],
        key=lambda s: s.overall_pct,
    )[:4]
    weak_areas = []
    for s in weak:
        concept = db.get(Concept, s.concept_id)
        if concept:
            weak_areas.append(WeakArea(concept=concept.name, pct=float(s.overall_pct)))

    # "Current mission" = the concept with the highest mastery below the
    # mastered threshold — i.e. closest to completion, most motivating to
    # finish next. A recommendation-engine upgrade candidate, not a hardcoded
    # rule that should live in the response model.
    in_progress = sorted(
        [s for s in snapshots if 0 < float(s.overall_pct) < 85],
        key=lambda s: -s.overall_pct,
    )
    mission_concept = None
    mission_pct = None
    if in_progress:
        concept = db.get(Concept, in_progress[0].concept_id)
        mission_concept = concept.name if concept else None
        mission_pct = float(in_progress[0].overall_pct)

    return DashboardResponse(
        current_mission_concept=mission_concept,
        current_mission_pct=mission_pct,
        weak_areas=weak_areas,
        engineering_level=current_user.profile.engineering_level if current_user.profile else 1,
    )


@router.get("/progress", response_model=list[MasteryBreakdown])
def get_mastery_breakdown(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[MasteryBreakdown]:
    snapshots = db.query(MasterySnapshot).filter(MasterySnapshot.user_id == current_user.id).all()
    out = []
    for s in snapshots:
        concept = db.get(Concept, s.concept_id)
        if not concept:
            continue
        out.append(
            MasteryBreakdown(
                concept=concept.name,
                understanding=float(s.understanding_pct),
                implementation=float(s.implementation_pct),
                debugging=float(s.debugging_pct),
                recall=float(s.recall_pct),
                overall=float(s.overall_pct),
            )
        )
    return out
