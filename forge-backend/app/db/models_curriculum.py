import enum
import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class QuestionType(str, enum.Enum):
    recall = "recall"
    explain = "explain"
    predict = "predict"
    debug = "debug"
    architecture = "architecture"
    code = "code"
    design = "design"


class AnswerFormat(str, enum.Enum):
    mcq = "mcq"
    free_text = "free_text"
    code = "code"
    diagram = "diagram"
    ordering = "ordering"
    matching = "matching"


class GradingMode(str, enum.Enum):
    deterministic = "deterministic"
    ai_assisted = "ai_assisted"


class Module(Base):
    __tablename__ = "modules"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    language_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("languages.id"))
    title: Mapped[str] = mapped_column(String(150))
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    lessons: Mapped[list["Lesson"]] = relationship(back_populates="module", order_by="Lesson.order_index")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    module_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("modules.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200))
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    documentation_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    summary_md: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=5)

    module: Mapped["Module"] = relationship(back_populates="lessons")
    concepts: Mapped[list["Concept"]] = relationship(back_populates="lesson")


class Concept(Base):
    __tablename__ = "concepts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    lesson_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("lessons.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    prerequisite_concept_ids: Mapped[list[str] | None] = mapped_column(ARRAY(UUID(as_uuid=False)), nullable=True)
    focus_points: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

    lesson: Mapped["Lesson"] = relationship(back_populates="concepts")
    questions: Mapped[list["Question"]] = relationship(back_populates="concept")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    concept_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("concepts.id", ondelete="CASCADE"))
    type: Mapped[QuestionType] = mapped_column(default=QuestionType.recall)
    prompt_md: Mapped[str] = mapped_column(Text)
    answer_format: Mapped[AnswerFormat] = mapped_column(default=AnswerFormat.mcq)
    correct_answer_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    grading_mode: Mapped[GradingMode] = mapped_column(default=GradingMode.deterministic)

    concept: Mapped["Concept"] = relationship(back_populates="questions")
