"""
AI Mentor — Groq Chat Completions integration for FORGE.
"""

import re

import httpx

from app.core.config import get_settings

settings = get_settings()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


MENTOR_SYSTEM_PROMPT = """You are the AI Mentor inside FORGE, an interactive
software engineering lab.

Your job is to help the learner become a stronger engineer, not simply give
them answers.

CORE BEHAVIOR:

1. Be conversational and natural. Speak like an experienced senior engineer
   helping a learner, not like a questionnaire.

2. ALWAYS MOVE THE CONVERSATION FORWARD.

3. Do not repeatedly ask "What do you think?", "What is your first step?",
   "What's your approach?", or similar questions.

4. Ask a guiding question only when it genuinely helps. Never ask a question
   just because you do not know what else to say.

5. If the learner has provided a challenge, code, error, test result, or
   technical question, immediately work with that information.

6. If the learner has already attempted the task, analyze their attempt
   instead of asking them to explain what they already showed you.

7. Prefer progressive hints over immediately revealing the solution.

8. NEVER claim code works, passes tests, or is correct unless actual test
   results in the context prove it.

9. Distinguish:
   - syntax errors
   - runtime errors
   - logic errors
   - conceptual misunderstandings
   - architectural mistakes

10. Reference the learner's actual code, error, and test results whenever
    available.

11. Adapt to the learner's skill level.

12. If the learner is confused, explain differently instead of repeating
    the same question.

13. Be warm, concise, practical, and encouraging.

14. Normal responses should usually be 2-5 sentences.

15. Do not turn the conversation into an interview. The mentor should feel
    like a real conversation.

IMPORTANT:

When the learner gives a greeting or casual message, do not invent a
technical task. Acknowledge them naturally and invite them to share what
they are working on.

When the learner asks for help without enough context, ask for the specific
thing they need help with rather than giving a generic programming lesson.

When challenge context exists, use it immediately.
"""


class AiMentorNotConfiguredError(RuntimeError):
    pass


class AiMentorProviderError(RuntimeError):
    pass


def _normalize_message(message: str) -> str:
    return re.sub(r"\s+", " ", message.strip().lower())


def _handle_simple_conversation(message: str) -> str | None:
    """
    Handle conversational messages locally instead of wasting an LLM call.

    This makes basic mentor interactions predictable and natural.
    """
    normalized = _normalize_message(message)

    greetings = {
        "hi",
        "hello",
        "hey",
        "hey there",
        "hiya",
        "yo",
        "sup",
        "good morning",
        "good afternoon",
        "good evening",
    }

    help_requests = {
        "help",
        "please help",
        "please guide me",
        "guide me",
        "i need help",
        "i need some help",
        "can you help me",
        "help me",
    }

    if normalized in greetings:
        return (
            "Hey! I'm your FORGE mentor. What are you working on? "
            "Send me the challenge, your code, or the error you're stuck on "
            "and we'll work through it together."
        )

    if normalized in help_requests:
        return (
            "Absolutely. Send me the challenge or the part you're stuck on, "
            "and include any code or error you're seeing. I'll guide you "
            "through it step by step without just giving you the answer."
        )

    return None


async def get_mentor_reply(
    *,
    user_message: str,
    challenge_title: str | None,
    challenge_description: str | None,
    current_code: str | None,
    last_test_result_summary: str | None,
    conversation_history: list[dict],
) -> str:
    if not settings.groq_api_key:
        raise AiMentorNotConfiguredError(
            "GROQ_API_KEY is not configured."
        )

    # ---------------------------------------------------------
    # Handle greetings/simple conversation locally.
    # ---------------------------------------------------------

    simple_reply = _handle_simple_conversation(user_message)

    if simple_reply:
        return simple_reply

    # ---------------------------------------------------------
    # Build technical context.
    # ---------------------------------------------------------

    context_parts: list[str] = []

    if challenge_title:
        context_parts.append(
            f"Challenge: {challenge_title}"
        )

    if challenge_description:
        context_parts.append(
            f"Description: {challenge_description}"
        )

    if current_code:
        context_parts.append(
            "Learner's current code:\n"
            f"```\n{current_code}\n```"
        )

    if last_test_result_summary:
        context_parts.append(
            "Actual last test result: "
            f"{last_test_result_summary}"
        )
    else:
        context_parts.append(
            "No tests have been run yet for this attempt."
        )

    context_block = "\n\n".join(context_parts)

    # ---------------------------------------------------------
    # Normalize conversation history.
    # ---------------------------------------------------------

    history: list[dict[str, str]] = []

    for message in conversation_history:
        role = message.get("role")
        content = message.get("content")

        if (
            role in {"user", "assistant", "system"}
            and isinstance(content, str)
            and content.strip()
        ):
            history.append(
                {
                    "role": role,
                    "content": content.strip(),
                }
            )

    messages = [
        {
            "role": "system",
            "content": MENTOR_SYSTEM_PROMPT,
        },
        *history,
        {
            "role": "user",
            "content": (
                f"{context_block}\n\n"
                f"Learner says: {user_message}"
            ),
        },
    ]

    # ---------------------------------------------------------
    # Groq request.
    # ---------------------------------------------------------

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": (
                        f"Bearer {settings.groq_api_key}"
                    ),
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.groq_model,
                    "messages": messages,
                    "max_tokens": 400,
                    "temperature": 0.4,
                },
            )

    except httpx.RequestError as exc:
        raise AiMentorProviderError(
            f"Unable to reach Groq: {exc}"
        ) from exc

    # ---------------------------------------------------------
    # Provider errors.
    # ---------------------------------------------------------

    if not response.is_success:
        try:
            error_data = response.json()
            error_obj = error_data.get("error", {})
            provider_message = error_obj.get(
                "message",
                response.text,
            )
        except (ValueError, TypeError):
            provider_message = response.text

        raise AiMentorProviderError(
            f"Groq API returned HTTP {response.status_code}: "
            f"{provider_message}"
        )

    # ---------------------------------------------------------
    # Parse response.
    # ---------------------------------------------------------

    try:
        data = response.json()
        choices = data.get("choices", [])

        if not choices:
            raise ValueError("No choices returned")

        content = choices[0]["message"]["content"]

    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise AiMentorProviderError(
            "Groq returned an unexpected response format."
        ) from exc

    if not isinstance(content, str) or not content.strip():
        raise AiMentorProviderError(
            "Groq returned an empty response."
        )

    return content.strip()
