from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.models_identity import Goal, User
from app.db.session import get_db

router = APIRouter(prefix="/users", tags=["users"])


class ProfileUpdateRequest(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    goal: Goal | None = None


class ProfileResponse(BaseModel):
    display_name: str
    avatar_url: str | None
    bio: str | None
    engineering_level: int
    goal: Goal | None


DEFAULT_PREFERENCES = {
    "reduced_motion": False,
    "email_digest": True,
    "review_reminders": True,
}


class PreferencesResponse(BaseModel):
    reduced_motion: bool
    email_digest: bool
    review_reminders: bool


class PreferencesUpdateRequest(BaseModel):
    reduced_motion: bool | None = None
    email_digest: bool | None = None
    review_reminders: bool | None = None


@router.get("/me/profile", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)) -> ProfileResponse:
    p = current_user.profile
    return ProfileResponse(
        display_name=p.display_name if p else "",
        avatar_url=p.avatar_url if p else None,
        bio=p.bio if p else None,
        engineering_level=p.engineering_level if p else 1,
        goal=p.goal if p else None,
    )


@router.patch("/me/profile", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileResponse:
    p = current_user.profile
    if payload.display_name is not None:
        p.display_name = payload.display_name
    if payload.bio is not None:
        p.bio = payload.bio
    if payload.goal is not None:
        p.goal = payload.goal
    db.commit()
    db.refresh(p)
    return ProfileResponse(
        display_name=p.display_name, avatar_url=p.avatar_url, bio=p.bio, engineering_level=p.engineering_level, goal=p.goal
    )


@router.get("/me/preferences", response_model=PreferencesResponse)
def get_preferences(current_user: User = Depends(get_current_user)) -> PreferencesResponse:
    prefs = {**DEFAULT_PREFERENCES, **(current_user.profile.preferences_json or {})}
    return PreferencesResponse(**prefs)


@router.patch("/me/preferences", response_model=PreferencesResponse)
def update_preferences(
    payload: PreferencesUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PreferencesResponse:
    p = current_user.profile
    current = {**DEFAULT_PREFERENCES, **(p.preferences_json or {})}
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    current.update(updates)
    p.preferences_json = current
    db.commit()
    return PreferencesResponse(**current)
