import { challengesApi } from "@/lib/api";

/**
 * Resolves where a "Continue" action for a given concept should actually
 * navigate. Previously these buttons (roadmap node detail, dashboard
 * mission card) had no onClick at all — this gives them real behavior
 * instead of faking it.
 *
 * Prefers a hands-on challenge tied to the concept; falls back to a
 * knowledge-check practice session scoped to that concept.
 */
export async function resolveContinueHref(
  conceptId: string,
  conceptTitle?: string
): Promise<string> {
  try {
    const challenges = await challengesApi.list();
    const match = challenges.find(
      (c) => c.concept === conceptId || (conceptTitle && c.concept === conceptTitle)
    );
    if (match) return `/challenge/${match.id}`;
  } catch {
    // fall through to practice — a failed lookup shouldn't block navigation
  }
  return `/practice?concept=${encodeURIComponent(conceptId)}`;
}
