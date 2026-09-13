import { EXERCISE_ANIMATIONS, type ExerciseAnimationId } from "./exerciseAnimations";

// Every seeded exercise has its own entry in EXERCISE_ANIMATIONS (verified
// 1:1 against apps/backend/src/data/exercises.ts when that file was
// built), so this is only a safety net for an exercise id that doesn't -
// e.g. a new one added to the backend without a matching animation yet.
const FALLBACK: ExerciseAnimationId = "standing_hamstring_stretch";

export function animationForExercise(exerciseId: string): ExerciseAnimationId {
  return exerciseId in EXERCISE_ANIMATIONS ? (exerciseId as ExerciseAnimationId) : FALLBACK;
}
