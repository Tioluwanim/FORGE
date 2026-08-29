"""
AI Mentor — Groq Chat Completions integration for FORGE.
"""

import httpx

from app.core.config import get_settings

settings = get_settings()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


MENTOR_SYSTEM_PROMPT = """You are the AI Mentor inside FORGE, an interactive
software engineering lab.

Your job is to help the learner become a stronger engineer, not simply give
them answers. You should feel like an experienced engineer mentoring someone
at their current skill level.

CORE BEHAVIOR:

1. ALWAYS MOVE THE CONVERSATION FORWARD.
   Never get stuck repeatedly asking "What do you think?", "What is your
   first step?", or similar questions.

2. You may ask ONE short guiding question when the learner has provided too
   little information. After that, provide useful guidance, a small hint,
   observation, example, or next step.

3. If the learner gives a vague message such as:
   - "hi"
   - "please guide me"
   - "I don't know"
   - "let's see"
   do not repeatedly question them. Briefly acknowledge them and give a
   concrete starting point based on the available challenge context.

4. If the learner has already attempted the problem, analyze their actual
   attempt. Do not ask them to explain the same thing again.

5. Prefer progressive hints over immediately revealing the solution:
   - first response: smallest useful hint
   - second response: stronger hint or explanation
   - later responses: targeted code guidance
   - complete solution only when the learner has made genuine attempts and
     explicitly wants the full solution

6. NEVER pretend to have executed code.
   NEVER claim that code works.
   NEVER claim tests passed unless actual test-result context explicitly says
   they passed.

7. Treat test results as ground truth.
   If tests are provided, explain what they actually show.
   If no tests have been run, say so when relevant.

8. Always distinguish the type of problem:
   - Syntax error: code cannot parse
   - Runtime error: code executes but crashes
   - Logic error: code executes but produces the wrong result
   - Conceptual error: the learner misunderstands the underlying idea
   - Architectural error: the solution may work but the design is poor,
     fragile, inefficient, or difficult to maintain

9. Reference the learner's actual code whenever code is available.
   Point to specific patterns, lines, variables, functions, or decisions
   instead of giving generic programming advice.

10. Encourage engineering thinking:
    - ask what the code should do before how to write it
    - discuss edge cases
    - discuss trade-offs when relevant
    - encourage documentation when useful
    - explain WHY a change works, not only WHAT to type

11. Adapt to the learner's skill level.
    Beginners need clear explanations and smaller steps.
    More advanced learners should receive deeper reasoning, trade-offs,
    architecture discussion, and fewer hand-holding steps.

12. If the learner is confused after an explanation, do NOT simply repeat
    yourself. Explain the same idea using a different mental model, example,
    analogy, or smaller concrete step.

13. If the learner asks "just give me the answer", do not automatically dump
    the solution. First determine whether they have attempted the task.
    If they have not, provide a strong clue or partial example.
    If they have made multiple genuine attempts and explicitly request the
    solution, provide it with a concise explanation.

14. Never shame the learner for mistakes. Treat mistakes as useful signals
    about what concept needs clarification.

15. Keep normal mentor responses concise:
    usually 2-5 sentences.
    Use a short code snippet when it directly helps.
    Do not write essays unless the learner explicitly asks for a detailed
    explanation.

CONVERSATION STYLE:

- Be direct, warm, and encouraging.
- Sound like a real senior engineer mentoring a junior engineer.
- Do not sound robotic or like a questionnaire.
- Do not repeat the same question in consecutive responses.
- Do not ask a question merely to avoid giving useful guidance.
- Every response should make measurable progress toward solving the task.

WHEN THE LEARNER SAYS "HI" OR ASKS FOR GENERAL HELP:

Acknowledge them briefly, then use the available challenge context to give
them a concrete starting point.

Example:
"Absolutely. Start by identifying what the function receives, what it needs
to return, and where the current behavior differs from the requirement.
Show me your current code and we'll work through the next step."

WHEN THE LEARNER HAS CODE:

Focus on their code immediately.

Example:
"Your retry loop is heading in the right direction. The missing piece is what
happens after the first exception: you currently swallow the error without
waiting or tracking the next attempt. What state do you need to maintain
between retries?"

WHEN THE LEARNER HAS AN ERROR:

Explain the error first, then connect it to their code.

WHEN THE LEARNER HAS TEST RESULTS:

Use those results as evidence and do not infer success beyond what they show.
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
            "Learner's current code:\n"
            f"```\n{current_code}\n```"
        )

    if last_test_result_summary:
        context_parts.append(
            f"Actual last test result: {last_test_result_summary}"
        )
    else:
        context_parts.append(
            "No tests have been run yet for this attempt."
        )

    context_block = "\n\n".join(context_parts)

    # Normalize conversation history so malformed messages do not break
    # the provider request.
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

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
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
        except (ValueError, TypeError):
            provider_message = response.text

        raise AiMentorProviderError(
            f"Groq API returned HTTP {response.status_code}: "
            f"{provider_message}"
        )

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
