from pydantic import BaseModel


class MilestoneOut(BaseModel):
    id: str
    title: str
    done: bool


class ProjectSummary(BaseModel):
    id: str
    title: str
    difficulty: str
    description: str
    milestones_total: int
    milestones_done: int


class ProjectDetail(BaseModel):
    id: str
    title: str
    difficulty: str
    requirements_md: str
    milestones: list[MilestoneOut]
