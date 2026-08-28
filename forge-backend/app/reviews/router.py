from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.models_curriculum import Concept
from app.db.models_identity import User
from app.db.models_progress import Review, ReviewStage
from app.db.session import get_db

router = APIRouter(prefix="/reviews", tags=["reviews"])

# day0 -> day2 -> day7 -> day21 -> day45, per plan §4.5 / §24
STAGE_SEQUENCE = [ReviewStage.day0, ReviewStage.day2, ReviewStage.day7, ReviewStage.day21, ReviewStage.day45]
STAGE_INTERVAL_DAYS = {ReviewStage.day0: 0, ReviewStage.day2: 2, ReviewStage.day7: 7, ReviewStage.day21: 21, ReviewStage.day45: 45}


class ReviewOut(BaseModel):
    id: str
    concept: str
    stage: str
    due_in: str


@router.get("", response_model=list[ReviewOut])
def list_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[ReviewOut]:
    reviews = db.query(Review).filter(Review.user_id == current_user.id).order_by(Review.due_at).all()
    now = datetime.now(timezone.utc)
    out = []
    for r in reviews:
        concept = db.get(Concept, r.concept_id)
        if not concept:
            continue
        days = (r.due_at - now).days
        due_in = "Today" if days <= 0 else ("Tomorrow" if days == 1 else f"In {days} days")
        out.append(ReviewOut(id=r.id, concept=concept.name, stage=r.interval_stage.value, due_in=due_in))
    return out


@router.post("/{review_id}/complete", response_model=ReviewOut)
def complete_review(
    review_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> ReviewOut:
    review = db.get(Review, review_id)
    if review is None or review.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Review not found")

    current_idx = STAGE_SEQUENCE.index(review.interval_stage)
    next_stage = STAGE_SEQUENCE[min(current_idx + 1, len(STAGE_SEQUENCE) - 1)]

    review.interval_stage = next_stage
    review.last_reviewed_at = datetime.now(timezone.utc)
    review.due_at = datetime.now(timezone.utc) + timedelta(days=STAGE_INTERVAL_DAYS[next_stage])
    db.commit()

    concept = db.get(Concept, review.concept_id)
    return ReviewOut(id=review.id, concept=concept.name if concept else "", stage=next_stage.value, due_in=f"In {STAGE_INTERVAL_DAYS[next_stage]} days")
