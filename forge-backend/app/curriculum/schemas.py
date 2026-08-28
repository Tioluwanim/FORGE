from pydantic import BaseModel


class ConceptSummary(BaseModel):
    id: str
    slug: str
    title: str
    module: str
    est_minutes: int

    model_config = {"from_attributes": True}


class ConceptDetail(BaseModel):
    id: str
    slug: str
    title: str
    module: str
    est_minutes: int
    doc_url: str | None
    focus: list[str]
    summary: str | None

    model_config = {"from_attributes": True}


class RoadmapNode(BaseModel):
    concept_id: str
    title: str
    status: str  # mastered | learning | weak | locked | recommended | review_required
    mastery_pct: float | None
