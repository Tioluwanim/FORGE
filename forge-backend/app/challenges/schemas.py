from pydantic import BaseModel


class ChallengeFileOut(BaseModel):
    path: str
    starter_content: str
    is_editable: bool

    model_config = {"from_attributes": True}


class HintOut(BaseModel):
    level: int
    content_md: str

    model_config = {"from_attributes": True}


class ChallengeSummary(BaseModel):
    id: str
    title: str
    difficulty: int
    concept: str | None

    model_config = {"from_attributes": True}


class ChallengeDetail(BaseModel):
    id: str
    title: str
    difficulty: int
    description_md: str
    learning_objectives: list[str]
    files: list[ChallengeFileOut]
    hints: list[HintOut]
    # Hidden test cases are intentionally never serialized to the client —
    # see forge-architecture-plan.md §16.

    model_config = {"from_attributes": True}
