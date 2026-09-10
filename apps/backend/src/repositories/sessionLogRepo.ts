import type { CompletedExercise, SessionLog, SkippedExercise } from "@adaptfit/shared";
import { prisma } from "../db";

export interface CreateSessionLogInput {
  userId: string;
  sessionId: string;
  completedExercises: CompletedExercise[];
  skippedExercises: SkippedExercise[];
  feedback: SessionLog["feedback"];
  durationSeconds: number | null;
}

export async function createSessionLog(input: CreateSessionLogInput): Promise<SessionLog> {
  const row = await prisma.sessionLog.create({
    data: {
      userId: input.userId,
      sessionId: input.sessionId,
      completedExercises: input.completedExercises as unknown as object,
      skippedExercises: input.skippedExercises as unknown as object,
      feedback: input.feedback,
      durationSeconds: input.durationSeconds,
    },
  });

  return {
    id: row.id,
    userId: row.userId,
    sessionId: row.sessionId,
    date: row.date.toISOString(),
    completedExercises: row.completedExercises as unknown as CompletedExercise[],
    skippedExercises: row.skippedExercises as unknown as SkippedExercise[],
    feedback: row.feedback as SessionLog["feedback"],
    durationSeconds: row.durationSeconds,
  };
}

export async function getRecentLogs(userId: string, limit = 10): Promise<SessionLog[]> {
  const rows = await prisma.sessionLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
  });
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    sessionId: row.sessionId,
    date: row.date.toISOString(),
    completedExercises: row.completedExercises as unknown as CompletedExercise[],
    skippedExercises: row.skippedExercises as unknown as SkippedExercise[],
    feedback: row.feedback as SessionLog["feedback"],
    durationSeconds: row.durationSeconds,
  }));
}
