from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models_identity import Language, Track
from app.db.models_progress import MasterySnapshot

LANGUAGE_LABELS = {"python": "Python", "javascript": "JavaScript", "java": "Java"}


def track_overall_pct(db: Session, track_id: str) -> float:
    """Average of each concept's overall_pct for this track — the simplest
    honest rollup. Swap for a weighted version (by concept difficulty, or by
    curriculum position) once there's real usage data to tune against."""
    avg = (
        db.query(func.avg(MasterySnapshot.overall_pct))
        .filter(MasterySnapshot.track_id == track_id)
        .scalar()
    )
    return float(avg) if avg is not None else 0.0


def serialize_track(db: Session, track: Track) -> dict:
    pct = track_overall_pct(db, track.id)
    return {
        "id": track.id,
        "language": track.language.code,
        "label": LANGUAGE_LABELS[track.language.code.value],
        "is_primary": track.is_primary,
        "pct": round(pct, 1),
        "status": "not_started" if pct == 0 else "in_progress",
    }


def get_or_create_language(db: Session, code: str) -> Language:
    lang = db.query(Language).filter(Language.code == code).first()
    if lang is None:
        lang = Language(code=code, name=code.capitalize())
        db.add(lang)
        db.flush()
    return lang
