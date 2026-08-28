import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class OAuthProvider(str, enum.Enum):
    google = "google"
    github = "github"


class Goal(str, enum.Enum):
    backend = "backend"
    fullstack = "fullstack"
    swe = "swe"
    interview = "interview"
    system_design = "system_design"
    upskilling = "upskilling"


class SkillLevel(str, enum.Enum):
    beginner = "beginner"
    know_language = "know_language"
    small_apps = "small_apps"
    builds_apis = "builds_apis"
    professional = "professional"


class LanguageCode(str, enum.Enum):
    python = "python"
    javascript = "javascript"
    java = "java"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    oauth_provider: Mapped[OAuthProvider | None] = mapped_column(Enum(OAuthProvider), nullable=True)
    oauth_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    profile: Mapped["Profile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    tracks: Mapped[list["Track"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    display_name: Mapped[str] = mapped_column(String(120), default="")
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    engineering_level: Mapped[int] = mapped_column(default=1)
    goal: Mapped[Goal | None] = mapped_column(Enum(Goal), nullable=True)
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Toggle preferences (reduced_motion, email_digest, review_reminders, ...).
    # Kept as a loose JSON bag rather than one column per toggle so new
    # preferences don't need a migration — see users/schemas.py for the keys
    # the frontend currently reads/writes.
    preferences_json: Mapped[dict] = mapped_column(JSONB, default=dict)

    user: Mapped["User"] = relationship(back_populates="profile")


class Language(Base):
    __tablename__ = "languages"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    code: Mapped[LanguageCode] = mapped_column(Enum(LanguageCode), unique=True)
    name: Mapped[str] = mapped_column(String(50))


class Track(Base):
    __tablename__ = "tracks"
    __table_args__ = (UniqueConstraint("user_id", "language_id", name="uq_user_language"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"))
    language_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("languages.id"))
    skill_level_at_start: Mapped[SkillLevel | None] = mapped_column(Enum(SkillLevel), nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="tracks")
    language: Mapped["Language"] = relationship()
