"""
AI Mentor — calls the Anthropic Messages API directly. See spec §17-18 for
the behavioral contract this system prompt encodes: hints before answers,
never claim tests passed without real results, distinguish syntax from
architectural mistakes, adapt to the learner's actual code and history.

If ANTHROPIC_API_KEY isn't set, this raises rather than returning a canned
"AI is thinking" placeholder — see the module-level rationale in
submissions/sandbox.py for why this codebase prefers loud failure over
quietly faking an AI response.
"""

import httpx

from app.core.config import get_settings

settings = get_settings()

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

MENTOR_SYSTEM_PROMPT = """You are the AI Mentor inside FORGE, an interactive \
software engineering lab. A learner is working through a coding challenge \
and needs help. Follow these rules without exception:

1. Ask what the learner already thinks before explaining, when it's a \
   reasonable first move.
2. Prefer hints over answers. Never give a full solution unless the \
   learner has clearly made multiple genuine attempts and explicitly asks \
   for the solution.
3. Explain errors in the context of the learner's actual code — reference \
   specific lines or patterns, not generic advice.
4. NEVER claim their code works or that tests passed. You have not \
   executed anything. Only report what the provided test-result context \
   (if any) actually says.
5. Encourage reading documentation over being told the answer.
6. Point out conceptual misunderstandings, not just syntax fixes.
7. Distinguish syntax errors ("this won't parse") from architectural \
   mistakes ("this will parse but doesn't solve the right problem").
8. Keep responses short — 2-4 sentences. This is a chat, not an essay.
9. If the learner seems to be asking you to just do the assignment for \
   them, redirect to a guiding question instead.
"""


class AiMentorNotConfiguredError(RuntimeError):
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
    if not settings.anthropic_api_key:
        raise AiMentorNotConfiguredError(
            "ANTHROPIC_API_KEY is not set — add it to .env to enable the AI Mentor."
        )

    context_parts = []
    if challenge_title:
        context_parts.append(f"Challenge: {challenge_title}")
    if challenge_description:
        context_parts.append(f"Description: {challenge_description}")
    if current_code:
        context_parts.append(f"Learner's current code:\n```\n{current_code}\n```")
    if last_test_result_summary:
        context_parts.append(f"Actual last test result: {last_test_result_summary}")
    else:
        context_parts.append("No tests have been run yet for this attempt.")

    context_block = "\n\n".join(context_parts)

    messages = [
        *conversation_history,
        {"role": "user", "content": f"{context_block}\n\nLearner says: {user_message}"},
    ]

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            ANTHROPIC_API_URL,
            headers={
                "x-api-key": settings.anthropic_api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": settings.anthropic_model,
                "max_tokens": 400,
                "system": MENTOR_SYSTEM_PROMPT,
                "messages": messages,
            },
        )
        response.raise_for_status()
        data = response.json()

    text_blocks = [block["text"] for block in data.get("content", []) if block.get("type") == "text"]
    return "\n".join(text_blocks).strip()
