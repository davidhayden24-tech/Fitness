import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

// `clerkMiddleware()` (mounted globally in index.ts) verifies the session
// token and attaches auth state to every request; this just enforces that a
// route actually has a signed-in user before it runs, and gives handlers a
// plain string to work with instead of re-deriving it from getAuth() every
// time. Clerk's own `requireAuth()` is deprecated in favor of this pattern.
export function requireUserId(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.locals.userId = userId;
  next();
}

export function currentUserId(res: Response): string {
  return res.locals.userId as string;
}
