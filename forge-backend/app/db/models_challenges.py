import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class SubmissionStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    passed = "passed"
    failed = "failed"
    error = "error"
    timeout = "timeout"


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    concept_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("concepts.id"), nullable=True)
    language_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("languages.id"))
    title: Mapped[str] = mapped_column(String(200))
    difficulty: Mapped[int] = mapped_column(Integer, default=1)
    description_md: Mapped[str] = mapped_column(Text)
    learning_objectives: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    runtime_limit_ms: Mapped[int] = mapped_column(Integer, default=5000)
    memory_limit_mb: Mapped[int] = mapped_column(Integer, default=256)
    difficulty_score: Mapped[float] = mapped_column(Numeric(4, 2), default=1.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    files: Mapped[list["ChallengeFile"]] = relationship(back_populates="challenge", cascade="all, delete-orphan")
    test_cases: Mapped[list["TestCase"]] = relationship(back_populates="challenge", cascade="all, delete-orphan")
    hints: Mapped[list["Hint"]] = relationship(back_populates="challenge", order_by="Hint.level", cascade="all, delete-orphan")
    concept: Mapped["Concept | None"] = relationship()


class ChallengeFile(Base):
    __tablename__ = "challenge_files"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    challenge_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("challenges.id", ondelete="CASCADE"))
    path: Mapped[str] = mapped_column(String(255))
    starter_content: Mapped[str] = mapped_column(Text, default="")
    is_editable: Mapped[bool] = mapped_column(Boolean, default=True)

    challenge: Mapped["Challenge"] = relationship(back_populates="files")


class TestCase(Base):
    __tablename__ = "test_cases"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    challenge_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("challenges.id", ondelete="CASCADE"))
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False)
    name: Mapped[str] = mapped_column(String(200))
    input_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    expected_output_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    challenge: Mapped["Challenge"] = relationship(back_populates="test_cases")


class Hint(Base):
    __tablename__ = "hints"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    challenge_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("challenges.id", ondelete="CASCADE"))
    level: Mapped[int] = mapped_column(Integer, default=1)
    content_md: Mapped[str] = mapped_column(Text)

    challenge: Mapped["Challenge"] = relationship(back_populates="hints")


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"))
    challenge_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("challenges.id"))
    track_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tracks.id"))
    status: Mapped[SubmissionStatus] = mapped_column(default=SubmissionStatus.queued)
    submitted_code_ref: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    result: Mapped["ExecutionResult | None"] = relationship(back_populates="submission", uselist=False, cascade="all, delete-orphan")


class ExecutionResult(Base):
    __tablename__ = "execution_results"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    submission_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("submissions.id", ondelete="CASCADE"), unique=True)
    tests_passed: Mapped[int] = mapped_column(Integer, default=0)
    tests_total: Mapped[int] = mapped_column(Integer, default=0)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    memory_used_mb: Mapped[int] = mapped_column(Integer, default=0)
    stdout_ref: Mapped[str | None] = mapped_column(String(500), nullable=True)
    stderr_ref: Mapped[str | None] = mapped_column(String(500), nullable=True)
    test_result_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    submission: Mapped["Submission"] = relationship(back_populates="result")
