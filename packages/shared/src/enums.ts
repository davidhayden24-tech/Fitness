// Canonical tag vocabularies. Both the Prisma schema (backend) and the
// mobile app import these so muscle-group / contraindication strings can
// never drift out of sync between the DB, the substitution engine, and the UI.

export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "obliques",
  "lower_back",
  "glutes",
  "quads",
  "hamstrings",
  "calves",
  "full_body",
  "cardio",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

// Body areas a user can flag as injured/painful, and the tag exercises
// carry to say "this movement is contraindicated for that area."
export const CONTRAINDICATION_TAGS = [
  "knee",
  "lower_back",
  "shoulder",
  "wrist",
  "ankle",
  "hip",
  "neck",
  "elbow",
] as const;
export type ContraindicationTag = (typeof CONTRAINDICATION_TAGS)[number];

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const FITNESS_LEVELS = DIFFICULTIES;
export type FitnessLevel = Difficulty;

export const GOALS = [
  "lose_weight",
  "tone_up",
  "build_muscle",
  "six_pack",
  "improve_endurance",
  "general_fitness",
] as const;
export type Goal = (typeof GOALS)[number];

// Why an exercise got swapped out. Drives the AdaptationEvent audit trail.
export const ADAPTATION_TRIGGERS = [
  "injury_flag",
  "thumbs_down",
  "missed_sessions",
  "coach_conversation",
] as const;
export type AdaptationTrigger = (typeof ADAPTATION_TRIGGERS)[number];

export const SESSION_FEEDBACK = ["too_easy", "too_hard", "pain", "good"] as const;
export type SessionFeedback = (typeof SESSION_FEEDBACK)[number];

export const SKIP_REASONS = ["pain", "too_hard", "no_time", "not_feeling_it", "other"] as const;
export type SkipReason = (typeof SKIP_REASONS)[number];

export const SUBSCRIPTION_STATUS = ["free", "active", "canceled", "past_due"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[number];

// The push/pull/legs/core/full-body rotation the weekly plan generator cycles through.
export const SPLIT_TYPES = ["push", "pull", "legs", "core", "full_body", "rest"] as const;
export type SplitType = (typeof SPLIT_TYPES)[number];
