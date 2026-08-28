from pydantic import BaseModel

from app.db.models_identity import LanguageCode, SkillLevel


class TrackCreateRequest(BaseModel):
    language: LanguageCode
    skill_level: SkillLevel
    make_primary: bool = True


class TrackResponse(BaseModel):
    id: str
    language: LanguageCode
    label: str
    is_primary: bool
    pct: float
    status: str  # "not_started" | "in_progress"

    model_config = {"from_attributes": True}
