from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.challenges.schemas import ChallengeDetail, ChallengeSummary
from app.core.uuid_utils import ensure_uuid
from app.db.models_challenges import Challenge
from app.db.session import get_db

router = APIRouter(prefix="/challenges", tags=["challenges"])


@router.get("", response_model=list[ChallengeSummary])
def list_challenges(db: Session = Depends(get_db)) -> list[ChallengeSummary]:
    challenges = db.query(Challenge).options(joinedload(Challenge.hints)).all()
    return [
        ChallengeSummary(
            id=c.id,
            title=c.title,
            difficulty=c.difficulty,
            concept=c.concept.name if c.concept_id and c.concept else None,
        )
        for c in challenges
    ]


@router.get("/{challenge_id}", response_model=ChallengeDetail)
def get_challenge(challenge_id: str, db: Session = Depends(get_db)) -> ChallengeDetail:
    challenge_id = ensure_uuid(challenge_id)
    challenge = (
        db.query(Challenge)
        .options(joinedload(Challenge.files), joinedload(Challenge.hints))
        .filter(Challenge.id == challenge_id)
        .first()
    )
    if challenge is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Challenge not found")

    return ChallengeDetail(
        id=challenge.id,
        title=challenge.title,
        difficulty=challenge.difficulty,
        description_md=challenge.description_md,
        learning_objectives=challenge.learning_objectives or [],
        files=list(challenge.files),
        hints=sorted(challenge.hints, key=lambda h: h.level),
    )
