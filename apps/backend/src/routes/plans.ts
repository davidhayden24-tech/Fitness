import { Router } from "express";
import { currentUserId, requireUserId } from "../auth/requireUserId";
import { UserNotFoundError } from "../services/adaptationService";
import { generateAndSaveNextWeek, getPlan } from "../services/planService";

export const plansRouter = Router();

plansRouter.post("/generate", requireUserId, async (_req, res) => {
  try {
    const plan = await generateAndSaveNextWeek(currentUserId(res));
    res.status(201).json(plan);
  } catch (err) {
    if (err instanceof UserNotFoundError) return res.status(404).json({ error: err.message });
    throw err;
  }
});

plansRouter.get("/current", requireUserId, async (_req, res) => {
  const plan = await getPlan(currentUserId(res));
  if (!plan) return res.status(404).json({ error: "No plan generated yet" });
  res.json(plan);
});
