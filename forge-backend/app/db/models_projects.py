import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class ProjectDifficulty(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class MilestoneValidation(str, enum.Enum):
    test_suite = "test_suite"
    manual = "manual"
    ai_review = "ai_review"


class UserProjectStatus(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    language_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("languages.id"))
    title: Mapped[str] = mapped_column(String(200))
    difficulty: Mapped[ProjectDifficulty] = mapped_column(default=ProjectDifficulty.beginner)
    requirements_md: Mapped[str] = mapped_column(Text)
    acceptance_criteria_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    milestones: Mapped[list["ProjectMilestone"]] = relationship(
        back_populates="project", order_by="ProjectMilestone.order_index", cascade="all, delete-orphan"
    )


class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("projects.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200))
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    validation_type: Mapped[MilestoneValidation] = mapped_column(default=MilestoneValidation.manual)

    project: Mapped["Project"] = relationship(back_populates="milestones")


class UserProject(Base):
    __tablename__ = "user_projects"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"))
    project_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("projects.id"))
    track_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tracks.id"))
    status: Mapped[UserProjectStatus] = mapped_column(default=UserProjectStatus.not_started)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    milestone_progress: Mapped[list["UserProjectMilestone"]] = relationship(
        back_populates="user_project", cascade="all, delete-orphan"
    )


class UserProjectMilestone(Base):
    __tablename__ = "user_project_milestones"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_project_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("user_projects.id", ondelete="CASCADE"))
    milestone_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("project_milestones.id"))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    validation_result_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    user_project: Mapped["UserProject"] = relationship(back_populates="milestone_progress")
