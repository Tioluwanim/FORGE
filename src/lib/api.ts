import { api } from "@/lib/api-client";

// --- Auth ------------------------------------------------------------
export interface TokenResponse {
  access_token: string;
  token_type: string;
}
export interface MeResponse {
  id: string;
  email: string;
  display_name: string;
  engineering_level: number;
  oauth_provider: string | null;
}

export const authApi = {
  signup: (email: string, password: string, display_name: string) =>
    api.post<TokenResponse>("/auth/signup", { email, password, display_name }),
  login: (email: string, password: string) =>
    api.post<TokenResponse>("/auth/login", { email, password }),
  me: () => api.get<MeResponse>("/auth/me"),
  changePassword: (current_password: string, new_password: string) =>
    api.post<void>("/auth/change-password", { current_password, new_password }),
};

// --- Tracks ------------------------------------------------------------
export interface TrackResponse {
  id: string;
  language: "python" | "javascript" | "java";
  label: string;
  is_primary: boolean;
  pct: number;
  status: "not_started" | "in_progress";
}

export const tracksApi = {
  list: () => api.get<TrackResponse[]>("/tracks"),
  create: (language: string, skill_level: string, make_primary = true) =>
    api.post<TrackResponse>("/tracks", { language, skill_level, make_primary }),
};

// --- Dashboard / Progress -----------------------------------------------
export interface DashboardResponse {
  current_mission_concept: string | null;
  current_mission_pct: number | null;
  weak_areas: { concept: string; pct: number }[];
  engineering_level: number;
}
export interface MasteryBreakdown {
  concept: string;
  understanding: number;
  implementation: number;
  debugging: number;
  recall: number;
  overall: number;
}

export const progressApi = {
  dashboard: () => api.get<DashboardResponse>("/dashboard"),
  breakdown: () => api.get<MasteryBreakdown[]>("/progress"),
};

// --- Curriculum / Roadmap -----------------------------------------------
export interface RoadmapNode {
  concept_id: string;
  title: string;
  status: "mastered" | "learning" | "weak" | "locked" | "recommended" | "review_required";
  mastery_pct: number | null;
}
export interface ConceptDetail {
  id: string;
  slug: string;
  title: string;
  module: string;
  est_minutes: number;
  doc_url: string | null;
  focus: string[];
  summary: string | null;
}

export const curriculumApi = {
  concepts: () => api.get<ConceptDetail[]>("/concepts"),
  concept: (slug: string) => api.get<ConceptDetail>(`/concepts/${slug}`),
  roadmap: (trackId: string) => api.get<RoadmapNode[]>(`/roadmap?track_id=${trackId}`),
};

// --- Challenges / Submissions --------------------------------------------
export interface ChallengeDetail {
  id: string;
  title: string;
  difficulty: number;
  description_md: string;
  learning_objectives: string[];
  files: { path: string; starter_content: string; is_editable: boolean }[];
  hints: { level: number; content_md: string }[];
}
export interface TestCaseResult {
  name: string;
  passed: boolean;
  duration_ms: number;
  message: string | null;
  hidden: boolean;
}
export interface SubmissionResultResponse {
  id: string;
  status: string;
  tests_passed: number;
  tests_total: number;
  duration_ms: number;
  results: TestCaseResult[];
  mode?: string | null; // "sandboxed_execution" | "dev_heuristic_no_execution"
}
export interface SubmissionAck {
  id: string;
  status: string;
}

export const challengesApi = {
  list: () => api.get<{ id: string; title: string; difficulty: number; concept: string | null }[]>("/challenges"),
  get: (id: string) => api.get<ChallengeDetail>(`/challenges/${id}`),
  /** Enqueues a submission — returns immediately with status "queued". Poll `getSubmission` for the result. */
  submit: (challengeId: string, trackId: string, files: Record<string, string>) =>
    api.post<SubmissionAck>(`/submissions/challenges/${challengeId}`, { track_id: trackId, files }),
  getSubmission: (submissionId: string) =>
    api.get<SubmissionResultResponse>(`/submissions/${submissionId}`),
};

const TERMINAL_STATUSES = new Set(["passed", "failed", "error", "timeout"]);

/**
 * Polls a submission until it leaves "queued"/"running". The worker that
 * actually executes the code may be on a completely different machine (see
 * the backend's sandbox_image/BUILD.md), so this has no fixed latency
 * assumption — it just keeps asking, with a gentle backoff, up to `maxWaitMs`.
 */
export async function pollSubmission(
  submissionId: string,
  { intervalMs = 700, maxWaitMs = 30000 }: { intervalMs?: number; maxWaitMs?: number } = {}
): Promise<SubmissionResultResponse> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const result = await challengesApi.getSubmission(submissionId);
    if (TERMINAL_STATUSES.has(result.status)) return result;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Timed out waiting for the sandbox to finish — it may still complete; check back shortly.");
}

// --- Projects ------------------------------------------------------------
export interface ProjectSummary {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  milestones_total: number;
  milestones_done: number;
}
export interface ProjectDetail {
  id: string;
  title: string;
  difficulty: string;
  requirements_md: string;
  milestones: { id: string; title: string; done: boolean }[];
}

export const projectsApi = {
  list: () => api.get<ProjectSummary[]>("/projects"),
  get: (id: string) => api.get<ProjectDetail>(`/projects/${id}`),
  start: (id: string) => api.post<void>(`/projects/${id}/start`),
};

// --- Reviews ------------------------------------------------------------
export interface ReviewOut {
  id: string;
  concept: string;
  stage: string;
  due_in: string;
}

export const reviewsApi = {
  list: () => api.get<ReviewOut[]>("/reviews"),
  complete: (id: string) => api.post<ReviewOut>(`/reviews/${id}/complete`),
};

// --- Production labs (Debugging Lab) --------------------------------------
export interface IncidentDetail {
  id: string;
  title: string;
  metrics: Record<string, { from: string; to: string; severity: string }>;
  logs: { lines: string[] };
}

export const incidentsApi = {
  list: () => api.get<{ id: string; title: string; difficulty: number }[]>("/incidents"),
  get: (id: string) => api.get<IncidentDetail>(`/incidents/${id}`),
  diagnose: (id: string, diagnosis_md: string) =>
    api.post<{ is_correct: boolean; root_cause_md: string }>(`/incidents/${id}/diagnose`, { diagnosis_md }),
};

// --- AI Mentor ------------------------------------------------------------
export const aiMentorApi = {
  chat: (payload: {
    message: string;
    challenge_id?: string;
    challenge_title?: string;
    challenge_description?: string;
    current_code?: string;
    last_test_result_summary?: string;
    conversation_history?: { role: string; content: string }[];
  }) => api.post<{ reply: string }>("/ai-mentor/chat", payload),
};

// --- Questions (knowledge checks) -----------------------------------------
export interface QuestionOut {
  id: string;
  type: string;
  prompt_md: string;
  answer_format: string;
  options: string[] | null;
}

export const questionsApi = {
  byConcept: (conceptId: string) => api.get<QuestionOut[]>(`/questions/by-concept/${conceptId}`),
  answer: (questionId: string, answer: string | number) =>
    api.post<{ correct: boolean | null; explanation: string | null }>(`/questions/${questionId}/answer`, { answer }),
};

// --- Users (profile / preferences) ----------------------------------------
export interface ProfileResponse {
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  engineering_level: number;
  goal: string | null;
}
export interface PreferencesResponse {
  reduced_motion: boolean;
  email_digest: boolean;
  review_reminders: boolean;
}

export const usersApi = {
  getProfile: () => api.get<ProfileResponse>("/users/me/profile"),
  updateProfile: (payload: Partial<Pick<ProfileResponse, "display_name" | "bio"> & { goal: string }>) =>
    api.patch<ProfileResponse>("/users/me/profile", payload),
  getPreferences: () => api.get<PreferencesResponse>("/users/me/preferences"),
  updatePreferences: (payload: Partial<PreferencesResponse>) =>
    api.patch<PreferencesResponse>("/users/me/preferences", payload),
};

// --- System Design ----------------------------------------------------------
export interface SystemDesignNode {
  id: string;
  type: string;
  x: number;
  y: number;
}
export interface ValidationIssue {
  message: string;
  severity: string;
}
export interface SystemDesignAttemptResponse {
  id: string;
  scenario_id: string;
  nodes: SystemDesignNode[];
  issues: ValidationIssue[];
}

export const systemDesignApi = {
  save: (nodes: SystemDesignNode[], scenarioId = "rate-limited-api") =>
    api.post<SystemDesignAttemptResponse>("/system-design/attempts", { scenario_id: scenarioId, nodes }),
  latest: (scenarioId = "rate-limited-api") =>
    api.get<SystemDesignAttemptResponse | null>(`/system-design/attempts/latest?scenario_id=${scenarioId}`),
};
