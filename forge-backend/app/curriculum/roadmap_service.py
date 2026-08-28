from datetime import datetime, timezone

from sqlalchemy.orm import Session, joinedload

from app.db.models_curriculum import Concept, Lesson, Module
from app.db.models_progress import MasterySnapshot, Review

MASTERED_THRESHOLD = 85
WEAK_THRESHOLD = 50


def compute_roadmap(db: Session, track_id: str, language_id: str) -> list[dict]:
    concepts = (
        db.query(Concept)
        .join(Lesson, Concept.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.language_id == language_id)
        .options(joinedload(Concept.lesson))
        .order_by(Module.order_index, Lesson.order_index)
        .all()
    )

    snapshots = {
        s.concept_id: s
        for s in db.query(MasterySnapshot).filter(MasterySnapshot.track_id == track_id).all()
    }
    reviews_due = {
        r.concept_id
        for r in db.query(Review)
        .filter(Review.track_id == track_id, Review.due_at <= datetime.now(timezone.utc))
        .all()
    }

    mastered_ids: set[str] = {
        cid for cid, snap in snapshots.items() if float(snap.overall_pct) >= MASTERED_THRESHOLD
    }

    nodes: list[dict] = []
    unlocked_found_recommended = False

    for concept in concepts:
        snap = snapshots.get(concept.id)
        pct = float(snap.overall_pct) if snap else None

        prereqs = concept.prerequisite_concept_ids or []
        locked = any(p not in mastered_ids for p in prereqs)

        if locked:
            status = "locked"
        elif concept.id in reviews_due:
            status = "review_required"
        elif pct is None:
            if not unlocked_found_recommended:
                status = "recommended"
                unlocked_found_recommended = True
            else:
                status = "locked"
        elif pct >= MASTERED_THRESHOLD:
            status = "mastered"
        elif pct < WEAK_THRESHOLD:
            status = "weak"
        else:
            status = "learning"

        nodes.append(
            {
                "concept_id": concept.id,
                "title": concept.name,
                "status": status,
                "mastery_pct": pct,
            }
        )

    return nodes
