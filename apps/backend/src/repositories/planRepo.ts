import type { WorkoutPlan } from "@adaptfit/shared";
import { prisma } from "../db";
import type { GeneratedSession } from "../engine/planGenerator";

export async function saveWeeklyPlan(
  userId: string,
  weekNumber: number,
  sessions: GeneratedSession[]
): Promise<WorkoutPlan> {
  const plan = await prisma.workoutPlan.create({
    data: {
      userId,
      weekNumber,
      sessions: {
        create: sessions.map((session) => ({
          dayNumber: session.dayNumber,
          splitType: session.splitType,
          exercises: {
            create: session.exercises.map((pe) => ({
              exerciseId: pe.exerciseId,
              order: pe.order,
              sets: pe.sets,
              reps: pe.reps,
              durationSeconds: pe.durationSeconds,
            })),
          },
        })),
      },
    },
    include: { sessions: { include: { exercises: true }, orderBy: { dayNumber: "asc" } } },
  });

  return {
    id: plan.id,
    userId: plan.userId,
    weekNumber: plan.weekNumber,
    sessions: plan.sessions.map((s) => ({
      id: s.id,
      dayNumber: s.dayNumber,
      splitType: s.splitType as GeneratedSession["splitType"],
      exercises: s.exercises
        .sort((a, b) => a.order - b.order)
        .map((pe) => ({
          exerciseId: pe.exerciseId,
          order: pe.order,
          sets: pe.sets,
          reps: pe.reps,
          durationSeconds: pe.durationSeconds,
        })),
    })),
  };
}

export async function getCurrentPlan(userId: string): Promise<WorkoutPlan | null> {
  const plan = await prisma.workoutPlan.findFirst({
    where: { userId },
    orderBy: { weekNumber: "desc" },
    include: { sessions: { include: { exercises: true }, orderBy: { dayNumber: "asc" } } },
  });
  if (!plan) return null;

  return {
    id: plan.id,
    userId: plan.userId,
    weekNumber: plan.weekNumber,
    sessions: plan.sessions.map((s) => ({
      id: s.id,
      dayNumber: s.dayNumber,
      splitType: s.splitType as GeneratedSession["splitType"],
      exercises: s.exercises
        .sort((a, b) => a.order - b.order)
        .map((pe) => ({
          exerciseId: pe.exerciseId,
          order: pe.order,
          sets: pe.sets,
          reps: pe.reps,
          durationSeconds: pe.durationSeconds,
        })),
    })),
  };
}
