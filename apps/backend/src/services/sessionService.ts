import type { WorkoutSession } from "@adaptfit/shared";
import { prisma } from "../db";
import { getExerciseLibrary } from "../repositories/exerciseRepo";
import { getUserById, toMinimalUserState } from "../repositories/userRepo";
import { UserNotFoundError } from "./adaptationService";
import { exerciseCountForSession, pickExercisesForSplit } from "../engine/planGenerator";
import type { SplitType } from "@adaptfit/shared";

function toWorkoutSession(row: {
  id: string;
  dayNumber: number;
  splitType: string;
  exercises: { exerciseId: string; order: number; sets: number | null; reps: number | null; durationSeconds: number | null }[];
}): WorkoutSession {
  return {
    id: row.id,
    dayNumber: row.dayNumber,
    splitType: row.splitType as SplitType,
    exercises: row.exercises
      .sort((a, b) => a.order - b.order)
      .map((pe) => ({
        exerciseId: pe.exerciseId,
        order: pe.order,
        sets: pe.sets,
        reps: pe.reps,
        durationSeconds: pe.durationSeconds,
      })),
  };
}

/** The next session in the user's current plan that has no SessionLog yet. */
export async function getTodaysSession(userId: string): Promise<WorkoutSession | null> {
  const plan = await prisma.workoutPlan.findFirst({
    where: { userId },
    orderBy: { weekNumber: "desc" },
    include: {
      sessions: {
        include: { exercises: true, logs: true },
        orderBy: { dayNumber: "asc" },
      },
    },
  });
  if (!plan) return null;

  const nextSession = plan.sessions.find((s) => s.logs.length === 0);
  return nextSession ? toWorkoutSession(nextSession) : null;
}

/**
 * Regenerate today's session in place to fit a shorter time budget - called
 * by the conversational coach when a user says e.g. "only have 10 minutes."
 * Keeps the same split (muscle-group target) but re-picks a smaller,
 * still-safe set of exercises, honoring the user's exclusions/injuries.
 */
export async function shortenTodaysSession(
  userId: string,
  maxMinutes: number
): Promise<WorkoutSession> {
  const user = await getUserById(userId);
  if (!user) throw new UserNotFoundError(userId);

  const session = await getTodaysSession(userId);
  if (!session) throw new Error("No session scheduled - generate a weekly plan first.");
  if (session.splitType === "rest") return session;

  const library = await getExerciseLibrary();
  const count = exerciseCountForSession(maxMinutes, library.length);
  const chosen = pickExercisesForSplit(
    session.splitType,
    library,
    toMinimalUserState(user),
    count
  );

  await prisma.$transaction([
    prisma.plannedExercise.deleteMany({ where: { sessionId: session.id } }),
    prisma.plannedExercise.createMany({
      data: chosen.map((ex, i) => ({
        sessionId: session.id,
        exerciseId: ex.id,
        order: i + 1,
        sets: ex.defaultSets,
        reps: ex.defaultReps,
        durationSeconds: ex.defaultDurationSeconds,
      })),
    }),
  ]);

  return {
    ...session,
    exercises: chosen.map((ex, i) => ({
      exerciseId: ex.id,
      order: i + 1,
      sets: ex.defaultSets,
      reps: ex.defaultReps,
      durationSeconds: ex.defaultDurationSeconds,
    })),
  };
}
