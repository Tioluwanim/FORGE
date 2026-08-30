"""
Language execution abstraction — forge-architecture-plan.md §55. The queue
job and the router only ever depend on this interface; they never know or
care which language is being executed. `PythonRunner` is the only concrete
implementation for now — `JavaScriptRunner` and `JavaRunner` slot in later
without touching anything outside `app/submissions/runners/`.
"""

from dataclasses import dataclass
from typing import Protocol


@dataclass
class RuntimeSpec:
    image: str
    workdir: str = "/workspace"


@dataclass
class ExecutionLimits:
    cpu_limit: float
    memory_mb: int
    pids_limit: int
    timeout_seconds: int


@dataclass
class ValidationIssue:
    message: str
    line: int | None = None


@dataclass
class TestOutcome:
    name: str
    passed: bool
    message: str | None = None
    hidden: bool = False


@dataclass
class RunResult:
    tests: list[TestOutcome]
    stdout: str
    stderr: str
    duration_ms: int
    exit_code: int
    timed_out: bool = False


class LanguageRunner(Protocol):
    def get_runtime(self) -> RuntimeSpec: ...
    def get_limits(self) -> ExecutionLimits: ...
    def validate(self, files: dict[str, str]) -> list[ValidationIssue]:
        """Cheap pre-flight checks (e.g. syntax) before paying for a container run."""
        ...
    def run(self, files: dict[str, str], harness_code: str) -> RunResult:
        """Executes `files` + the challenge's test harness inside an isolated container."""
        ...
