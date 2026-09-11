import type {
  AdaptationEvent,
  ContraindicationTag,
  Exercise,
  Goal,
  FitnessLevel,
  SessionFeedback,
  SkipReason,
  User,
  WorkoutPlan,
  WorkoutSession,
} from "@adaptfit/shared";

// Points at the backend from apps/backend. Set EXPO_PUBLIC_API_URL in a .env
// file for a device/simulator that can't reach localhost directly.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export interface OnboardingInput {
  fitnessLevel: FitnessLevel;
  goals: Goal[];
  flaggedInjuries: ContraindicationTag[];
  minutesPerSession?: number;
  daysPerWeek?: number;
}

export type GetToken = () => Promise<string | null>;

/**
 * Every route below requires a signed-in Clerk session except getExercises
 * (the exercise library is public read-only content). The backend derives
 * the user from the bearer token - nothing here ever sends a userId, so a
 * client can only ever act as itself.
 */
export function createApi(getToken: GetToken) {
  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AdaptFit API ${res.status}: ${body}`);
    }
    return res.json() as Promise<T>;
  }

  return {
    completeOnboarding: (input: OnboardingInput) =>
      request<User>("/api/users", { method: "POST", body: JSON.stringify(input) }),

    getMe: () => request<User>("/api/users/me"),

    getExercises: () => request<Exercise[]>("/api/exercises"),

    generatePlan: () => request<WorkoutPlan>("/api/plans/generate", { method: "POST" }),

    getCurrentPlan: () => request<WorkoutPlan>("/api/plans/current"),

    flagInjury: (bodyArea: ContraindicationTag) =>
      request<{ excludedExerciseIds: string[]; flaggedInjuries: ContraindicationTag[] }>(
        "/api/feedback/injury",
        { method: "POST", body: JSON.stringify({ bodyArea }) }
      ),

    giveExerciseFeedback: (exerciseId: string, reason: SkipReason) =>
      request<{ excludedExerciseIds: string[] }>("/api/feedback/exercise", {
        method: "POST",
        body: JSON.stringify({ exerciseId, reason }),
      }),

    logSession: (input: {
      sessionId: string;
      completedExercises: { exerciseId: string; setsCompleted?: number | null; repsCompleted?: number | null; durationCompletedSeconds?: number | null }[];
      skippedExercises: { exerciseId: string; reason: SkipReason }[];
      feedback?: SessionFeedback | null;
      durationSeconds?: number | null;
    }) => request<{ id: string }>("/api/logs", { method: "POST", body: JSON.stringify(input) }),

    checkin: (message: string) =>
      request<{ reply: string }>("/api/coach/checkin", {
        method: "POST",
        body: JSON.stringify({ message }),
      }),

    getProgress: () =>
      request<{
        totalSessionsCompleted: number;
        currentStreakDays: number;
        adaptationsCount: number;
        recentAdaptations: { originalExerciseId: string; substituteExerciseId: string; trigger: string; timestamp: string }[];
      }>("/api/progress/me"),

    verifySubscriptionPurchase: (platform: "android" | "ios", purchaseToken: string) =>
      request<{ subscriptionStatus: string; subscriptionExpiresAt: string | null }>(
        "/api/billing/verify",
        { method: "POST", body: JSON.stringify({ platform, purchaseToken }) }
      ),
  };
}

export type Api = ReturnType<typeof createApi>;

export type { AdaptationEvent, Exercise, User, WorkoutPlan, WorkoutSession };
