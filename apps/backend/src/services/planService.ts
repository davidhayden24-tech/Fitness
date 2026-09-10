import type { WorkoutPlan } from "@adaptfit/shared";
import { getExerciseLibrary } from "../repositories/exerciseRepo";
import { getCurrentPlan, saveWeeklyPlan } from "../repositories/planRepo";
import { getUserById, toMinimalUserState } from "../repositories/userRepo";
import { UserNotFoundError } from "./adaptationService";
import { generateWeeklyPlan } from "../engine/planGenerator";

export async function generateAndSaveNextWeek(userId: string): Promise<WorkoutPlan> {
  const user = await getUserById(userId);
  if (!user) throw new UserNotFoundError(userId);

  const library = await getExerciseLibrary();
  const currentPlan = await getCurrentPlan(userId);
  const nextWeekNumber = (currentPlan?.weekNumber ?? 0) + 1;

  const sessions = generateWeeklyPlan({
    user: toMinimalUserState(user),
    library,
    weekNumber: nextWeekNumber,
  });

  return saveWeeklyPlan(userId, nextWeekNumber, sessions);
}

export async function getPlan(userId: string): Promise<WorkoutPlan | null> {
  return getCurrentPlan(userId);
}
