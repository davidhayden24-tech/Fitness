import { z } from "zod";
import { CONTRAINDICATION_TAGS, SKIP_REASONS } from "./enums";

// Structured output the conversational coach's LLM call must produce.
// The LLM never invents a workout - it maps free text into these signals,
// then plain application code (the substitution engine / session shortener)
// acts on them. This schema doubles as the Anthropic tool `input_schema`.

export const flagPainInputSchema = z.object({
  bodyArea: z.enum(CONTRAINDICATION_TAGS),
  severity: z.enum(["mild", "moderate", "severe"]).default("moderate"),
  note: z.string().optional(),
});
export type FlagPainInput = z.infer<typeof flagPainInputSchema>;

export const skipExerciseInputSchema = z.object({
  exerciseId: z.string(),
  reason: z.enum(SKIP_REASONS),
});
export type SkipExerciseInput = z.infer<typeof skipExerciseInputSchema>;

export const shortenSessionInputSchema = z.object({
  maxMinutes: z.number().int().positive().max(180),
});
export type ShortenSessionInput = z.infer<typeof shortenSessionInputSchema>;

export const getTodaysSessionInputSchema = z.object({});
export type GetTodaysSessionInput = z.infer<typeof getTodaysSessionInputSchema>;

export const COACH_TOOLS = {
  flag_pain: {
    description:
      "Record that the user is experiencing pain/discomfort in a body area. This permanently excludes contraindicated exercises and substitutes them going forward. Call this whenever the user mentions pain, soreness, or an old injury acting up - even mild.",
    inputSchema: flagPainInputSchema,
  },
  skip_exercise: {
    description:
      "Skip a single exercise in today's session for a stated reason, without treating it as an injury flag (e.g. 'not feeling it', 'too hard').",
    inputSchema: skipExerciseInputSchema,
  },
  shorten_session: {
    description:
      "Regenerate today's session to fit within a shorter time budget, keeping the highest-priority exercises for the user's current split.",
    inputSchema: shortenSessionInputSchema,
  },
  get_todays_session: {
    description: "Fetch the user's current planned session for today, after any adaptations.",
    inputSchema: getTodaysSessionInputSchema,
  },
} as const;

export type CoachToolName = keyof typeof COACH_TOOLS;
