from pydantic import BaseModel


class WeakArea(BaseModel):
    concept: str
    pct: float


class MasteryBreakdown(BaseModel):
    concept: str
    understanding: float
    implementation: float
    debugging: float
    recall: float
    overall: float


class DashboardResponse(BaseModel):
    current_mission_concept: str | None
    current_mission_pct: float | None
    weak_areas: list[WeakArea]
    engineering_level: int
