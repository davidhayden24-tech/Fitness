import { Router } from "express";
import { z } from "zod";
import { CONTRAINDICATION_TAGS, SKIP_REASONS } from "@adaptfit/shared";
import { currentUserId, requireUserId } from "../auth/requireUserId";
import { flagInjury, giveExerciseFeedback, UserNotFoundError } from "../services/adaptationService";

export const feedbackRouter = Router();

const injuryFlagSchema = z.object({
  bodyArea: z.enum(CONTRAINDICATION_TAGS),
});

// This is the "persistent adaptive rerouting" surface: flagging a body area
// permanently excludes and substitutes every contraindicated exercise, not
// just for today's session.
feedbackRouter.post("/injury", requireUserId, async (req, res) => {
  const parsed = injuryFlagSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const outcome = await flagInjury(currentUserId(res), parsed.data.bodyArea);
    res.status(200).json(outcome);
  } catch (err) {
    if (err instanceof UserNotFoundError) return res.status(404).json({ error: err.message });
    throw err;
  }
});

const exerciseFeedbackSchema = z.object({
  exerciseId: z.string(),
  reason: z.enum(SKIP_REASONS),
});

feedbackRouter.post("/exercise", requireUserId, async (req, res) => {
  const parsed = exerciseFeedbackSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const outcome = await giveExerciseFeedback(
      currentUserId(res),
      parsed.data.exerciseId,
      parsed.data.reason
    );
    res.status(200).json(outcome);
  } catch (err) {
    if (err instanceof UserNotFoundError) return res.status(404).json({ error: err.message });
    throw err;
  }
});
