import Anthropic from "@anthropic-ai/sdk";
import { getUserById } from "../repositories/userRepo";
import { getTodaysSession } from "../services/sessionService";
import { getRecentLogs } from "../repositories/sessionLogRepo";
import { getExerciseLibrary } from "../repositories/exerciseRepo";
import { buildCoachTools } from "./tools";
import { prisma } from "../db";
import { UserNotFoundError } from "../services/adaptationService";

const client = new Anthropic();
const MODEL = "claude-opus-5";
const MEMORY_CHAR_LIMIT = 800;

const SYSTEM_PROMPT_INTRO = `You are AdaptFit's check-in coach. Your job is to have a brief, warm,
pre-workout conversation with the user and translate anything relevant they
say into structured tool calls - you never invent exercises, substitutions,
or session content yourself. If they mention pain, soreness, or an old
injury, call flag_pain. If they want to skip one exercise without it being
an injury, call skip_exercise. If they're short on time, call
shorten_session. If they just want to know what's today, call
get_todays_session. Keep replies to 2-3 sentences, encouraging but honest -
never tell someone to push through pain.`;

async function buildSystemPrompt(userId: string): Promise<string> {
  const user = await getUserById(userId);
  if (!user) throw new UserNotFoundError(userId);

  const [session, recentLogs, library] = await Promise.all([
    getTodaysSession(userId),
    getRecentLogs(userId, 5),
    getExerciseLibrary(),
  ]);

  const sessionSummary = session
    ? session.exercises
        .map((pe) => library.find((e) => e.id === pe.exerciseId)?.name ?? pe.exerciseId)
        .join(", ")
    : "no session scheduled yet";

  const feedbackSummary = recentLogs
    .map((l) => `${l.date.slice(0, 10)}: ${l.feedback ?? "no feedback"}`)
    .join("; ");

  return [
    SYSTEM_PROMPT_INTRO,
    `User fitness level: ${user.fitnessLevel}.`,
    `Flagged injuries/pain areas: ${user.flaggedInjuries.join(", ") || "none"}.`,
    `Today's planned session (split: ${session?.splitType ?? "n/a"}): ${sessionSummary}.`,
    `Recent session feedback: ${feedbackSummary || "none yet"}.`,
    user.coachMemorySummary ? `Known recurring notes about this user: ${user.coachMemorySummary}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function appendCoachMemory(userId: string, userMessage: string): Promise<void> {
  const user = await getUserById(userId);
  if (!user) return;
  const entry = `[${new Date().toISOString().slice(0, 10)}] ${userMessage}`;
  const updated = [user.coachMemorySummary, entry].filter(Boolean).join(" | ").slice(-MEMORY_CHAR_LIMIT);
  await prisma.user.update({ where: { id: userId }, data: { coachMemorySummary: updated } });
}

export interface CheckinResult {
  reply: string;
}

export async function runCheckin(userId: string, userMessage: string): Promise<CheckinResult> {
  const system = await buildSystemPrompt(userId);
  const tools = buildCoachTools(userId);

  const finalMessage = await client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 1024,
    system,
    tools,
    messages: [{ role: "user", content: userMessage }],
  });

  await appendCoachMemory(userId, userMessage);

  const textBlock = finalMessage.content.find(
    (b): b is Anthropic.Beta.BetaTextBlock => b.type === "text"
  );

  return { reply: textBlock?.text ?? "Got it - see you in the session." };
}
