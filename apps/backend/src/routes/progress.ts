import { Router } from "express";
import { currentUserId, requireUserId } from "../auth/requireUserId";
import { getProgressSummary } from "../services/progressService";

export const progressRouter = Router();

progressRouter.get("/me", requireUserId, async (_req, res) => {
  const summary = await getProgressSummary(currentUserId(res));
  res.json(summary);
});
