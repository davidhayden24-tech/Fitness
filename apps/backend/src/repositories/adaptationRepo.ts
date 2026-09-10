import type { AdaptationEvent } from "@adaptfit/shared";
import { prisma } from "../db";

export async function recordAdaptationEvents(
  userId: string,
  events: Omit<AdaptationEvent, "id" | "userId" | "timestamp">[]
): Promise<void> {
  if (events.length === 0) return;
  await prisma.adaptationEvent.createMany({
    data: events.map((e) => ({
      userId,
      trigger: e.trigger,
      originalExerciseId: e.originalExerciseId,
      substituteExerciseId: e.substituteExerciseId,
      contraindicationTag: e.contraindicationTag,
      note: e.note,
    })),
  });
}

export async function getAdaptationHistory(userId: string): Promise<AdaptationEvent[]> {
  const rows = await prisma.adaptationEvent.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    trigger: r.trigger as AdaptationEvent["trigger"],
    originalExerciseId: r.originalExerciseId,
    substituteExerciseId: r.substituteExerciseId,
    contraindicationTag: r.contraindicationTag as AdaptationEvent["contraindicationTag"],
    note: r.note,
    timestamp: r.timestamp.toISOString(),
  }));
}
