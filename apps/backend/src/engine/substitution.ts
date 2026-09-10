// The deterministic substitution engine. This is the wedge feature described
// in the spec: substitutions are computed by plain, testable application
// code from pre-authored tags (muscle_groups / contraindications /
// substitute_group_id) - never invented by the LLM. The conversational
// coach (see src/coach) only calls into this module via tool-calling.

import type {
  AdaptationEvent,
  AdaptationTrigger,
  ContraindicationTag,
  Difficulty,
  Exercise,
} from "@adaptfit/shared";

export interface MinimalUserState {
  fitnessLevel: Difficulty;
  flaggedInjuries: ContraindicationTag[];
  excludedExerciseIds: string[];
}

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

/** True if the exercise is safe for a user with the given flagged injuries. */
export function isContraindicated(
  exercise: Exercise,
  flaggedInjuries: ContraindicationTag[]
): boolean {
  if (flaggedInjuries.length === 0) return false;
  return exercise.contraindications.some((tag) => flaggedInjuries.includes(tag));
}

export function isEligible(
  exercise: Exercise,
  user: MinimalUserState,
  extraExcludedIds: Iterable<string> = []
): boolean {
  const extra = extraExcludedIds instanceof Set ? extraExcludedIds : new Set(extraExcludedIds);
  if (user.excludedExerciseIds.includes(exercise.id)) return false;
  if (extra.has(exercise.id)) return false;
  if (isContraindicated(exercise, user.flaggedInjuries)) return false;
  return true;
}

/**
 * Find a biomechanically equivalent, currently-safe replacement for
 * `original`. Preference order:
 *   1. Same substitute_group_id (curated interchangeable set), eligible.
 *   2. Any exercise sharing at least one muscle group with the original,
 *      eligible.
 * Within each tier, rank by closeness of difficulty to the original (or to
 * the user's fitness level if the original itself is now excluded/unknown),
 * then break ties deterministically by exercise id so results are stable
 * and testable.
 */
export function findSubstitute(
  original: Exercise,
  library: Exercise[],
  user: MinimalUserState,
  alreadyChosenIds: Iterable<string> = []
): Exercise | null {
  const chosen = alreadyChosenIds instanceof Set ? alreadyChosenIds : new Set(alreadyChosenIds);
  const targetDifficultyRank = DIFFICULTY_RANK[original.difficulty];

  const rank = (candidates: Exercise[]): Exercise | null => {
    const pool = candidates.filter(
      (c) => c.id !== original.id && !chosen.has(c.id) && isEligible(c, user, chosen)
    );
    if (pool.length === 0) return null;
    pool.sort((a, b) => {
      const da = Math.abs(DIFFICULTY_RANK[a.difficulty] - targetDifficultyRank);
      const db = Math.abs(DIFFICULTY_RANK[b.difficulty] - targetDifficultyRank);
      if (da !== db) return da - db;
      return a.id.localeCompare(b.id);
    });
    return pool[0];
  };

  const sameGroup = library.filter((c) => c.substituteGroupId === original.substituteGroupId);
  const bySubstituteGroup = rank(sameGroup);
  if (bySubstituteGroup) return bySubstituteGroup;

  const sameMuscle = library.filter((c) =>
    c.muscleGroups.some((mg) => original.muscleGroups.includes(mg))
  );
  return rank(sameMuscle);
}

export interface SubstitutionResult {
  updatedExcludedExerciseIds: string[];
  updatedFlaggedInjuries: ContraindicationTag[];
  events: Omit<AdaptationEvent, "id" | "userId" | "timestamp">[];
}

function buildEvent(
  trigger: AdaptationTrigger,
  originalExerciseId: string,
  substituteExerciseId: string,
  contraindicationTag: ContraindicationTag | null,
  note: string | null
): Omit<AdaptationEvent, "id" | "userId" | "timestamp"> {
  return { trigger, originalExerciseId, substituteExerciseId, contraindicationTag, note };
}

/**
 * A user flags a body area as painful/injured. Every exercise in the
 * library contraindicated for that area is permanently excluded and, where
 * a safe substitute exists, an AdaptationEvent records what would replace
 * it. This is library-wide and persistent - it is not a one-day skip.
 */
export function applyInjuryFlag(
  bodyArea: ContraindicationTag,
  library: Exercise[],
  user: MinimalUserState
): SubstitutionResult {
  const updatedFlaggedInjuries = user.flaggedInjuries.includes(bodyArea)
    ? user.flaggedInjuries
    : [...user.flaggedInjuries, bodyArea];

  const userWithFlag: MinimalUserState = { ...user, flaggedInjuries: updatedFlaggedInjuries };

  const newlyExcluded = new Set<string>(user.excludedExerciseIds);
  const events: Omit<AdaptationEvent, "id" | "userId" | "timestamp">[] = [];

  const affected = library.filter(
    (ex) => ex.contraindications.includes(bodyArea) && !user.excludedExerciseIds.includes(ex.id)
  );

  for (const exercise of affected) {
    newlyExcluded.add(exercise.id);
    const substitute = findSubstitute(
      exercise,
      library,
      { ...userWithFlag, excludedExerciseIds: Array.from(newlyExcluded) },
      newlyExcluded
    );
    if (substitute) {
      events.push(
        buildEvent(
          "injury_flag",
          exercise.id,
          substitute.id,
          bodyArea,
          `Excluded "${exercise.name}" - contraindicated for ${bodyArea}.`
        )
      );
    }
  }

  return {
    updatedExcludedExerciseIds: Array.from(newlyExcluded),
    updatedFlaggedInjuries,
    events,
  };
}

/**
 * A user gives explicit negative feedback on one exercise (thumbs-down, or
 * "this hurt" without naming a general body area). Permanently swap it for
 * a same-muscle-group alternative in every future routine.
 */
export function applyExerciseFeedback(
  exerciseId: string,
  reason: "pain" | "too_hard" | "dislike",
  library: Exercise[],
  user: MinimalUserState
): SubstitutionResult {
  const original = library.find((ex) => ex.id === exerciseId);
  if (!original) {
    return {
      updatedExcludedExerciseIds: user.excludedExerciseIds,
      updatedFlaggedInjuries: user.flaggedInjuries,
      events: [],
    };
  }

  const updatedExcludedExerciseIds = user.excludedExerciseIds.includes(exerciseId)
    ? user.excludedExerciseIds
    : [...user.excludedExerciseIds, exerciseId];

  const substitute = findSubstitute(original, library, {
    ...user,
    excludedExerciseIds: updatedExcludedExerciseIds,
  });

  const trigger: AdaptationTrigger = "thumbs_down";
  const events = substitute
    ? [
        buildEvent(
          trigger,
          original.id,
          substitute.id,
          null,
          `User marked "${original.name}" as ${reason}.`
        ),
      ]
    : [];

  return { updatedExcludedExerciseIds, updatedFlaggedInjuries: user.flaggedInjuries, events };
}
