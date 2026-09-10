import { Router } from "express";
import { z } from "zod";
import { SESSION_FEEDBACK, SKIP_REASONS } from "@adaptfit/shared";
import { currentUserId, requireUserId } from "../auth/requireUserId";
import { createSessionLog } from "../repositories/sessionLogRepo";

export const logsRouter = Router();

const sessionLogSchema = z.object({
  sessionId: z.string(),
  completedExercises: z.array(
    z.object({
      exerciseId: z.string(),
      setsCompleted: z.number().int().nullable().optional(),
      repsCompleted: z.number().int().nullable().optional(),
      durationCompletedSeconds: z.number().int().nullable().optional(),
    })
  ),
  skippedExercises: z.array(
    z.object({
      exerciseId: z.string(),
      reason: z.enum(SKIP_REASONS),
    })
  ),
  feedback: z.enum(SESSION_FEEDBACK).nullable().optional(),
  durationSeconds: z.number().int().nullable().optional(),
});

logsRouter.post("/", requireUserId, async (req, res) => {
  const parsed = sessionLogSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const log = await createSessionLog({
    userId: currentUserId(res),
    sessionId: parsed.data.sessionId,
    completedExercises: parsed.data.completedExercises.map((c) => ({
      exerciseId: c.exerciseId,
      setsCompleted: c.setsCompleted ?? null,
      repsCompleted: c.repsCompleted ?? null,
      durationCompletedSeconds: c.durationCompletedSeconds ?? null,
    })),
    skippedExercises: parsed.data.skippedExercises,
    feedback: parsed.data.feedback ?? null,
    durationSeconds: parsed.data.durationSeconds ?? null,
  });

  res.status(201).json(log);
});
