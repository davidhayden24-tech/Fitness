import type { AdaptationEvent, ContraindicationTag, SkipReason } from "@adaptfit/shared";
import { getExerciseLibrary } from "../repositories/exerciseRepo";
import { applyAdaptationToUser, getUserById, toMinimalUserState } from "../repositories/userRepo";
import { recordAdaptationEvents } from "../repositories/adaptationRepo";
import { applyExerciseFeedback, applyInjuryFlag } from "../engine/substitution";

export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
  }
}

export interface AdaptationOutcome {
  excludedExerciseIds: string[];
  flaggedInjuries: ContraindicationTag[];
  events: Omit<AdaptationEvent, "id" | "userId" | "timestamp">[];
}

/** User flags a body area as painful/injured - excludes every contraindicated exercise, permanently. */
export async function flagInjury(userId: string, bodyArea: ContraindicationTag): Promise<AdaptationOutcome> {
  const user = await getUserById(userId);
  if (!user) throw new UserNotFoundError(userId);

  const library = await getExerciseLibrary();
  const result = applyInjuryFlag(bodyArea, library, toMinimalUserState(user));

  await applyAdaptationToUser(userId, result.updatedExcludedExerciseIds, result.updatedFlaggedInjuries);
  await recordAdaptationEvents(userId, result.events);

  return {
    excludedExerciseIds: result.updatedExcludedExerciseIds,
    flaggedInjuries: result.updatedFlaggedInjuries,
    events: result.events,
  };
}

const PAIN_OR_HARD: SkipReason[] = ["pain", "too_hard"];

/**
 * User gives explicit negative feedback on one exercise (thumbs-down /
 * "this hurt"). Permanently swaps it for a same-muscle-group alternative.
 */
export async function giveExerciseFeedback(
  userId: string,
  exerciseId: string,
  reason: SkipReason
): Promise<AdaptationOutcome> {
  const user = await getUserById(userId);
  if (!user) throw new UserNotFoundError(userId);

  const library = await getExerciseLibrary();
  const mappedReason = reason === "pain" ? "pain" : PAIN_OR_HARD.includes(reason) ? "too_hard" : "dislike";
  const result = applyExerciseFeedback(exerciseId, mappedReason, library, toMinimalUserState(user));

  await applyAdaptationToUser(userId, result.updatedExcludedExerciseIds, result.updatedFlaggedInjuries);
  await recordAdaptationEvents(userId, result.events);

  return {
    excludedExerciseIds: result.updatedExcludedExerciseIds,
    flaggedInjuries: result.updatedFlaggedInjuries,
    events: result.events,
  };
}
