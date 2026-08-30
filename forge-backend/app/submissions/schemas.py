from pydantic import BaseModel


class SubmissionCreateRequest(BaseModel):
    track_id: str
    files: dict[str, str]  # path -> content


class SubmissionResponse(BaseModel):
    id: str
    status: str


class TestCaseResult(BaseModel):
    name: str
    passed: bool
    duration_ms: int
    message: str | None = None
    hidden: bool = False


class SubmissionResultResponse(BaseModel):
    id: str
    status: str
    tests_passed: int
    tests_total: int
    duration_ms: int
    results: list[TestCaseResult]
    mode: str | None = None  # "sandboxed_execution" | "dev_heuristic_no_execution" — shown in dev tooling, not hidden from the client
