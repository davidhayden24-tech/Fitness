import { Router } from "express";
import { z } from "zod";
import { currentUserId, requireUserId } from "../auth/requireUserId";
import { runCheckin } from "../coach/coachService";
import { UserNotFoundError } from "../services/adaptationService";
import { getUserById } from "../repositories/userRepo";

export const coachRouter = Router();

const checkinSchema = z.object({
  message: z.string().min(1).max(2000),
});

// The conversational check-in coach - the paid layer per the pricing model
// (free tier gets plan generation + adaptation). The mobile client also
// shows a paywall UI, but that's a UX nicety, not a security boundary - the
// subscriptionStatus check below is what actually enforces it, since a
// client can always be modified to skip its own UI gate.
coachRouter.post("/checkin", requireUserId, async (req, res) => {
  const parsed = checkinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = currentUserId(res);
  const user = await getUserById(userId);
  if (!user) return res.status(404).json({ error: "Complete onboarding first" });
  if (user.subscriptionStatus !== "active") {
    return res.status(402).json({ error: "AdaptFit Plus subscription required for the check-in coach" });
  }

  try {
    const result = await runCheckin(userId, parsed.data.message);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof UserNotFoundError) return res.status(404).json({ error: err.message });
    throw err;
  }
});
