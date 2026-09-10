import { prisma } from "../db";
import { getAdaptationHistory } from "../repositories/adaptationRepo";

export interface ProgressSummary {
  totalSessionsCompleted: number;
  currentStreakDays: number;
  adaptationsCount: number;
  recentAdaptations: { originalExerciseId: string; substituteExerciseId: string; trigger: string; timestamp: string }[];
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getProgressSummary(userId: string): Promise<ProgressSummary> {
  const logs = await prisma.sessionLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  const uniqueDays = Array.from(new Set(logs.map((l) => toDateKey(l.date)))).sort().reverse();

  let currentStreakDays = 0;
  if (uniqueDays.length > 0) {
    const cursor = new Date();
    for (const dayKey of uniqueDays) {
      const expected = toDateKey(cursor);
      if (dayKey === expected) {
        currentStreakDays += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (dayKey < expected) {
        break;
      }
    }
  }

  const adaptationHistory = await getAdaptationHistory(userId);

  return {
    totalSessionsCompleted: logs.length,
    currentStreakDays,
    adaptationsCount: adaptationHistory.length,
    recentAdaptations: adaptationHistory.slice(0, 10).map((e) => ({
      originalExerciseId: e.originalExerciseId,
      substituteExerciseId: e.substituteExerciseId,
      trigger: e.trigger,
      timestamp: e.timestamp,
    })),
  };
}
