import "dotenv/config";
import cors from "cors";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { usersRouter } from "./routes/users";
import { exercisesRouter } from "./routes/exercises";
import { plansRouter } from "./routes/plans";
import { feedbackRouter } from "./routes/feedback";
import { logsRouter } from "./routes/logs";
import { coachRouter } from "./routes/coach";
import { progressRouter } from "./routes/progress";

const app = express();
app.use(cors());
app.use(express.json());
// Verifies the session token on every request and makes auth state
// available via getAuth(req); routes opt into requiring it via
// requireUserId (see src/auth/requireUserId.ts).
app.use(clerkMiddleware());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/users", usersRouter);
app.use("/api/exercises", exercisesRouter);
app.use("/api/plans", plansRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/logs", logsRouter);
app.use("/api/coach", coachRouter);
app.use("/api/progress", progressRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`AdaptFit backend listening on :${port}`);
});
