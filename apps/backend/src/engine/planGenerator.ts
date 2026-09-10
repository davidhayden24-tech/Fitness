// Rules-based weekly plan generator. Produces a push/pull/legs/core/full-body
// rotation from the user's goals + fitness level, then filters every
// candidate exercise through the exclusion/contraindication list before
// scheduling - so an adapted user can never be handed an excluded exercise,
// even on a freshly generated week.

import type { Difficulty, Exercise, PlannedExercise, WorkoutSession } from "@adaptfit/shared";
import { isEligible, type MinimalUserState } from "./substitution";
import { SPLIT_MUSCLE_GROUPS, splitForDayIndex } from "./split";

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const MINUTES_PER_EXERCISE = 4; // rough estimate incl. rest, used to size a session
const MIN_EXERCISES_PER_SESSION = 3;
const MAX_EXERCISES_PER_SESSION = 10;

export interface PlanGeneratorInput {
  user: MinimalUserState & { daysPerWeek: number; minutesPerSession: number };
  library: Exercise[];
  weekNumber: number;
}

export interface GeneratedSession extends WorkoutSession {}

export function exerciseCountForSession(minutesPerSession: number, available: number): number {
  const target = Math.round(minutesPerSession / MINUTES_PER_EXERCISE);
  return Math.max(MIN_EXERCISES_PER_SESSION, Math.min(target, MAX_EXERCISES_PER_SESSION, available));
}

export function pickExercisesForSplit(
  splitType: Exclude<import("@adaptfit/shared").SplitType, "rest">,
  library: Exercise[],
  user: MinimalUserState,
  count: number
): Exercise[] {
  const targetMuscles = SPLIT_MUSCLE_GROUPS[splitType];
  const targetRank = DIFFICULTY_RANK[user.fitnessLevel];

  const candidates = library
    .filter((ex) => ex.muscleGroups.some((mg) => targetMuscles.includes(mg)))
    .filter((ex) => isEligible(ex, user));

  // Prefer exercises matching the user's difficulty, then spread across
  // distinct muscle groups within the split so a session isn't e.g. five
  // chest variants in a row. Deterministic tie-break by id for testability.
  const scored = candidates
    .map((ex) => ({
      ex,
      difficultyDelta: Math.abs(DIFFICULTY_RANK[ex.difficulty] - targetRank),
    }))
    .sort((a, b) => {
      if (a.difficultyDelta !== b.difficultyDelta) return a.difficultyDelta - b.difficultyDelta;
      return a.ex.id.localeCompare(b.ex.id);
    });

  const picked: Exercise[] = [];
  const usedMuscleGroups = new Set<string>();

  for (const { ex } of scored) {
    if (picked.length >= count) break;
    const introducesNewMuscle = ex.muscleGroups.some(
      (mg) => targetMuscles.includes(mg) && !usedMuscleGroups.has(mg)
    );
    if (introducesNewMuscle || picked.length < targetMuscles.length) {
      picked.push(ex);
      ex.muscleGroups.forEach((mg) => usedMuscleGroups.add(mg));
    }
  }

  // Fill any remaining slots from the rest of the scored pool.
  for (const { ex } of scored) {
    if (picked.length >= count) break;
    if (!picked.includes(ex)) picked.push(ex);
  }

  return picked;
}

export function generateWeeklyPlan(input: PlanGeneratorInput): GeneratedSession[] {
  const { user, library, weekNumber } = input;
  const sessions: GeneratedSession[] = [];

  for (let dayIndex = 0; dayIndex < user.daysPerWeek; dayIndex++) {
    const splitType = splitForDayIndex(dayIndex);
    const count = exerciseCountForSession(user.minutesPerSession, library.length);
    const chosen = pickExercisesForSplit(splitType, library, user, count);

    const exercises: PlannedExercise[] = chosen.map((ex, i) => ({
      exerciseId: ex.id,
      order: i + 1,
      sets: ex.defaultSets,
      reps: ex.defaultReps,
      durationSeconds: ex.defaultDurationSeconds,
    }));

    sessions.push({
      id: `week${weekNumber}-day${dayIndex + 1}`,
      dayNumber: dayIndex + 1,
      splitType,
      exercises,
    });
  }

  return sessions;
}
