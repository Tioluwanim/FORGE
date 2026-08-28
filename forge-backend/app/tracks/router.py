from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.models_identity import Track, User
from app.db.session import get_db
from app.tracks.schemas import TrackCreateRequest, TrackResponse
from app.tracks.service import get_or_create_language, serialize_track

router = APIRouter(prefix="/tracks", tags=["tracks"])


@router.get("", response_model=list[TrackResponse])
def list_tracks(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[dict]:
    tracks = db.query(Track).filter(Track.user_id == current_user.id).all()
    return [serialize_track(db, t) for t in tracks]


@router.post("", response_model=TrackResponse, status_code=status.HTTP_201_CREATED)
def create_track(
    payload: TrackCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    language = get_or_create_language(db, payload.language.value)

    existing = (
        db.query(Track)
        .filter(Track.user_id == current_user.id, Track.language_id == language.id)
        .first()
    )
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Track already exists for this language")

    if payload.make_primary:
        db.query(Track).filter(Track.user_id == current_user.id).update({"is_primary": False})

    track = Track(
        user_id=current_user.id,
        language_id=language.id,
        skill_level_at_start=payload.skill_level,
        is_primary=payload.make_primary,
    )
    db.add(track)
    db.commit()
    db.refresh(track)
    return serialize_track(db, track)


@router.post("/{track_id}/set-primary", response_model=TrackResponse)
def set_primary_track(
    track_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    track = db.get(Track, track_id)
    if track is None or track.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Track not found")

    db.query(Track).filter(Track.user_id == current_user.id).update({"is_primary": False})
    track.is_primary = True
    db.commit()
    db.refresh(track)
    return serialize_track(db, track)
