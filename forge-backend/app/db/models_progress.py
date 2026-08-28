import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class AttemptKind(str, enum.Enum):
    question = "question"
    challenge = "challenge"
    debug_lab = "debug_lab"
    project_milestone = "project_milestone"


class AttemptResult(str, enum.Enum):
    pass_ = "pass"
    fail = "fail"
    partial = "partial"


class ReviewStage(str, enum.Enum):
    day0 = "day0"
    day2 = "day2"
    day7 = "day7"
    day21 = "day21"
    day45 = "day45"


class Attempt(Base):
    """Raw signal, append-only. Never mutated after creation."""

    __tablename__ = "attempts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"))
    concept_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("concepts.id"), nullable=True)
    challenge_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("challenges.id"), nullable=True)
    question_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("questions.id"), nullable=True)
    kind: Mapped[AttemptKind] = mapped_column()
    result: Mapped[AttemptResult] = mapped_column()
    hints_used: Mapped[int] = mapped_column(Integer, default=0)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class MasterySnapshot(Base):
    """Computed cache, refreshed by a worker — never written to directly by request handlers."""

    __tablename__ = "mastery_snapshots"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"))
    concept_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("concepts.id"))
    track_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tracks.id"))
    understanding_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    implementation_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    debugging_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    recall_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    overall_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"))
    concept_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("concepts.id"))
    track_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tracks.id"))
    interval_stage: Mapped[ReviewStage] = mapped_column(default=ReviewStage.day0)
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    last_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
