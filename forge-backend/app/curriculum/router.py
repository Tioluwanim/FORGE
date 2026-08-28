from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.curriculum.roadmap_service import compute_roadmap
from app.curriculum.schemas import ConceptDetail, ConceptSummary, RoadmapNode
from app.db.models_curriculum import Concept
from app.db.models_identity import Track, User
from app.db.session import get_db

router = APIRouter(tags=["curriculum"])


@router.get("/concepts", response_model=list[ConceptSummary])
def list_concepts(db: Session = Depends(get_db)) -> list[ConceptSummary]:
    concepts = db.query(Concept).options(joinedload(Concept.lesson)).all()
    return [
        ConceptSummary(
            id=c.id,
            slug=c.slug,
            title=c.name,
            module=c.lesson.module.title if c.lesson and c.lesson.module else "",
            est_minutes=c.lesson.estimated_minutes if c.lesson else 5,
        )
        for c in concepts
    ]


@router.get("/concepts/{slug}", response_model=ConceptDetail)
def get_concept(slug: str, db: Session = Depends(get_db)) -> ConceptDetail:
    concept = db.query(Concept).filter(Concept.slug == slug).options(joinedload(Concept.lesson)).first()
    if concept is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Concept not found")

    return ConceptDetail(
        id=concept.id,
        slug=concept.slug,
        title=concept.name,
        module=concept.lesson.module.title if concept.lesson and concept.lesson.module else "",
        est_minutes=concept.lesson.estimated_minutes if concept.lesson else 5,
        doc_url=concept.lesson.documentation_url if concept.lesson else None,
        focus=concept.focus_points or [],
        summary=concept.lesson.summary_md if concept.lesson else None,
    )


@router.get("/roadmap", response_model=list[RoadmapNode])
def get_roadmap(
    track_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    track = db.get(Track, track_id)
    if track is None or track.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Track not found")

    return compute_roadmap(db, track_id=track.id, language_id=track.language_id)
