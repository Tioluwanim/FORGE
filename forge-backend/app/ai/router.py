import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.ai.service import (
    AiMentorNotConfiguredError,
    AiMentorProviderError,
    get_mentor_reply,
)
from app.core.deps import get_current_user
from app.db.models_identity import User
from app.db.models_platform import AiSession
from app.db.session import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai-mentor", tags=["ai"])


class ConversationMessage(BaseModel):
    role: str
    content: str


class MentorChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)

    challenge_id: str | None = None
    challenge_title: str | None = None
    challenge_description: str | None = None
    current_code: str | None = None
    last_test_result_summary: str | None = None

    conversation_history: list[ConversationMessage] = Field(
        default_factory=list
    )


class MentorChatResponse(BaseModel):
    reply: str


@router.post(
    "/chat",
    response_model=MentorChatResponse,
)
async def chat(
    payload: MentorChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MentorChatResponse:

    # Keep conversation history compatible with the provider API.
    conversation_history = [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in payload.conversation_history
        if message.role in {"user", "assistant"}
    ]

    try:
        reply = await get_mentor_reply(
            user_message=payload.message,
            challenge_title=payload.challenge_title,
            challenge_description=payload.challenge_description,
            current_code=payload.current_code,
            last_test_result_summary=payload.last_test_result_summary,
            conversation_history=conversation_history,
        )

    except AiMentorNotConfiguredError as exc:
        logger.error("AI Mentor is not configured: %s", exc)

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI Mentor is currently unavailable.",
        ) from exc

    except AiMentorProviderError as exc:
        # This is the important debugging output for your current Groq issue.
        logger.error(
            "AI Mentor provider failure for user %s: %s",
            current_user.id,
            exc,
            exc_info=True,
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI Mentor provider returned an error.",
        ) from exc

    except Exception as exc:
        logger.exception(
            "Unexpected AI Mentor failure for user %s",
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The AI Mentor encountered an unexpected error.",
        ) from exc

    # Save the mentor session separately from the provider call.
    # A database logging failure should not make an otherwise successful
    # AI response fail for the learner.
    try:
        db.add(
            AiSession(
                user_id=current_user.id,
                context_type=(
                    "challenge"
                    if payload.challenge_id
                    else "general"
                ),
                context_ref_id=payload.challenge_id,
            )
        )
        db.commit()

    except SQLAlchemyError:
        db.rollback()

        logger.exception(
            "Failed to save AI Mentor session for user %s",
            current_user.id,
        )

    return MentorChatResponse(reply=reply)
