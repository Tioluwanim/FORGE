from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.models_curriculum import Question
from app.db.models_identity import User
from app.db.models_progress import Attempt, AttemptKind, AttemptResult
from app.db.session import get_db

router = APIRouter(prefix="/questions", tags=["questions"])


class QuestionOut(BaseModel):
    id: str
    type: str
    prompt_md: str
    answer_format: str
    options: list[str] | None = None  # only populated for mcq; correct answer never included

    model_config = {"from_attributes": True}


class AnswerRequest(BaseModel):
    answer: str | int  # index for mcq, free text otherwise


class AnswerResult(BaseModel):
    correct: bool | None  # None for ai_assisted/free-text questions pending review
    explanation: str | None = None


@router.get("/by-concept/{concept_id}", response_model=list[QuestionOut])
def questions_for_concept(concept_id: str, db: Session = Depends(get_db)) -> list[QuestionOut]:
    questions = db.query(Question).filter(Question.concept_id == concept_id).all()
    out = []
    for q in questions:
        options = None
        if q.answer_format.value == "mcq" and q.correct_answer_json:
            options = q.correct_answer_json.get("options")
        out.append(
            QuestionOut(id=q.id, type=q.type.value, prompt_md=q.prompt_md, answer_format=q.answer_format.value, options=options)
        )
    return out


@router.post("/{question_id}/answer", response_model=AnswerResult)
def answer_question(
    question_id: str,
    payload: AnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnswerResult:
    question = db.get(Question, question_id)
    if question is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found")

    correct: bool | None = None
    if question.grading_mode.value == "deterministic" and question.correct_answer_json:
        correct = payload.answer == question.correct_answer_json.get("correct_index")
        result = AttemptResult.pass_ if correct else AttemptResult.fail
    else:
        # ai_assisted free-text grading — route through the AI Mentor service
        # (app/ai/service.py) once that grading prompt is written; recorded
        # as partial for now so it doesn't silently count as a pass.
        result = AttemptResult.partial

    db.add(
        Attempt(
            user_id=current_user.id,
            concept_id=question.concept_id,
            question_id=question.id,
            kind=AttemptKind.question,
            result=result,
        )
    )
    db.commit()

    return AnswerResult(correct=correct)
