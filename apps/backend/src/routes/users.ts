import { Router } from "express";
import { z } from "zod";
import { clerkClient } from "@clerk/express";
import { CONTRAINDICATION_TAGS, FITNESS_LEVELS, GOALS } from "@adaptfit/shared";
import { getUserById, upsertUserProfile } from "../repositories/userRepo";
import { currentUserId, requireUserId } from "../auth/requireUserId";

export const usersRouter = Router();

const onboardingSchema = z.object({
  fitnessLevel: z.enum(FITNESS_LEVELS),
  goals: z.array(z.enum(GOALS)).min(1),
  flaggedInjuries: z.array(z.enum(CONTRAINDICATION_TAGS)).default([]),
  minutesPerSession: z.number().int().positive().max(180).optional(),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
});

// Completes onboarding (or re-runs it) for the signed-in Clerk user. The id
// and email are taken from the verified session/Clerk user record, never
// from the request body - a client can only ever write its own profile.
usersRouter.post("/", requireUserId, async (req, res) => {
  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const userId = currentUserId(res);
  const clerkUser = await clerkClient.users.getUser(userId);
  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) {
    return res.status(400).json({ error: "Clerk account has no verified email address" });
  }

  const user = await upsertUserProfile(userId, email, parsed.data);
  res.status(201).json(user);
});

usersRouter.get("/me", requireUserId, async (_req, res) => {
  const user = await getUserById(currentUserId(res));
  if (!user) return res.status(404).json({ error: "Complete onboarding first" });
  res.json(user);
});
