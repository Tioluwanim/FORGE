"""
AI Mentor — Groq Chat Completions integration for FORGE.
"""

import httpx

from app.core.config import get_settings

settings = get_settings()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

MENTOR_SYSTEM_PROMPT = """You are the AI Mentor inside FORGE, an interactive
software engineering lab. A learner is working through a coding challenge
and needs help. Follow these rules without exception:

1. Ask what the learner already thinks before explaining, when it's a
   reasonable first move.
2. Prefer hints over answers. Never give a full solution unless the
   learner has clearly made multiple genuine attempts and explicitly asks
   for the solution.
3. Explain errors in the context of the learner's actual code — reference
   specific lines or patterns, not generic advice.
4. NEVER claim their code works or that tests passed. You have not
   executed anything. Only report what the provided test-result context
   (if any) actually says.
5. Encourage reading documentation over being told the answer.
6. Point out conceptual misunderstandings, not just syntax fixes.
7. Distinguish syntax errors ("this won't parse") from architectural
   mistakes ("this will parse but doesn't solve the right problem").
8. Keep responses short — 2-4 sentences.
9. If the learner seems to be asking you to just do the assignment for
   them, redirect to a guiding question instead.
"""


class AiMentorNotConfiguredError(RuntimeError):
    pass


class AiMentorProviderError(RuntimeError):
    pass


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

    context_parts: list[str] = []

    if challenge_title:
        context_parts.append(f"Challenge: {challenge_title}")

    if challenge_description:
        context_parts.append(
            f"Description: {challenge_description}"
        )

    if current_code:
        context_parts.append(
            f"Learner's current code:\n"
            f"```\n{current_code}\n```"
        )

    if last_test_result_summary:
        context_parts.append(
            f"Actual last test result: "
            f"{last_test_result_summary}"
        )
    else:
        context_parts.append(
            "No tests have been run yet for this attempt."
        )

    context_block = "\n\n".join(context_parts)

    # Normalize history so malformed roles don't break the Groq request.
    history = []
    for message in conversation_history:
        role = message.get("role")
        content = message.get("content")

        if role in {"user", "assistant", "system"} and isinstance(content, str):
            history.append(
                {
                    "role": role,
                    "content": content,
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

    if not response.is_success:
        try:
            error_data = response.json()
            error_obj = error_data.get("error", {})
            provider_message = error_obj.get(
                "message",
                response.text,
            )
        except ValueError:
            provider_message = response.text

        raise AiMentorProviderError(
            f"Groq API returned HTTP {response.status_code}: "
            f"{provider_message}"
        )

    try:
        data = response.json()
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise AiMentorProviderError(
            "Groq returned an unexpected response format."
        ) from exc

    if not content:
        raise AiMentorProviderError(
            "Groq returned an empty response."
        )

    return content.strip()
