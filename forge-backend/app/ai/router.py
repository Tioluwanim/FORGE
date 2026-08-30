from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ai.service import AiMentorNotConfiguredError, get_mentor_reply
from app.core.deps import get_current_user
from app.db.models_identity import User
from app.db.models_platform import AiSession
from app.db.session import get_db

router = APIRouter(prefix="/ai-mentor", tags=["ai"])


class MentorChatRequest(BaseModel):
    message: str
    challenge_id: str | None = None
    challenge_title: str | None = None
    challenge_description: str | None = None
    current_code: str | None = None
    last_test_result_summary: str | None = None
    conversation_history: list[dict] = []


class MentorChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=MentorChatResponse)
async def chat(
    payload: MentorChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MentorChatResponse:
    try:
        reply = await get_mentor_reply(
            user_message=payload.message,
            challenge_title=payload.challenge_title,
            challenge_description=payload.challenge_description,
            current_code=payload.current_code,
            last_test_result_summary=payload.last_test_result_summary,
            conversation_history=payload.conversation_history,
        )
    except AiMentorNotConfiguredError as e:
        raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, str(e)) from e

    db.add(
        AiSession(
            user_id=current_user.id,
            context_type="challenge" if payload.challenge_id else "general",
            context_ref_id=payload.challenge_id,
        )
    )
    db.commit()

    return MentorChatResponse(reply=reply)
