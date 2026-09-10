import type {
  AdaptationTrigger,
  ContraindicationTag,
  Difficulty,
  FitnessLevel,
  Goal,
  MuscleGroup,
  SessionFeedback,
  SkipReason,
  SplitType,
  SubscriptionStatus,
} from "./enums";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: MuscleGroup[];
  equipment: "none";
  difficulty: Difficulty;
  contraindications: ContraindicationTag[];
  substituteGroupId: string;
  videoAssetRef: string | null;
  defaultSets: number | null;
  defaultReps: number | null;
  defaultDurationSeconds: number | null;
}

export interface User {
  id: string;
  email: string;
  fitnessLevel: FitnessLevel;
  goals: Goal[];
  flaggedInjuries: ContraindicationTag[];
  excludedExerciseIds: string[];
  minutesPerSession: number;
  daysPerWeek: number;
  subscriptionStatus: SubscriptionStatus;
  coachMemorySummary: string | null;
}

export interface PlannedExercise {
  exerciseId: string;
  order: number;
  sets: number | null;
  reps: number | null;
  durationSeconds: number | null;
}

export interface WorkoutSession {
  id: string;
  dayNumber: number;
  splitType: SplitType;
  exercises: PlannedExercise[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  weekNumber: number;
  sessions: WorkoutSession[];
}

export interface CompletedExercise {
  exerciseId: string;
  setsCompleted: number | null;
  repsCompleted: number | null;
  durationCompletedSeconds: number | null;
}

export interface SkippedExercise {
  exerciseId: string;
  reason: SkipReason;
}

export interface SessionLog {
  id: string;
  userId: string;
  sessionId: string;
  date: string;
  completedExercises: CompletedExercise[];
  skippedExercises: SkippedExercise[];
  feedback: SessionFeedback | null;
  durationSeconds: number | null;
}

export interface AdaptationEvent {
  id: string;
  userId: string;
  trigger: AdaptationTrigger;
  originalExerciseId: string;
  substituteExerciseId: string;
  contraindicationTag: ContraindicationTag | null;
  note: string | null;
  timestamp: string;
}
