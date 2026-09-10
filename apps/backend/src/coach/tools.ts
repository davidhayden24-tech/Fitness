// Tool-calling surface for the conversational coach. The LLM never invents
// a workout or a substitution here - each tool's `run()` just calls the
// deterministic services (adaptationService / sessionService), which in
// turn call the rules-based substitution engine. The LLM's only job is to
// map free text ("my knee hurts", "only have 10 min") onto these calls.
//
// Tools are declared with raw JSON Schema (via `betaTool`) rather than
// `betaZodTool` - the SDK's zod helper pins to zod's newer internal type
// shape, which fights the plain zod v3 schemas @adaptfit/shared exports for
// route validation. JSON Schema keeps both in sync without a version dance.

import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { CONTRAINDICATION_TAGS, COACH_TOOLS, SKIP_REASONS } from "@adaptfit/shared";
import { flagInjury, giveExerciseFeedback } from "../services/adaptationService";
import { getTodaysSession, shortenTodaysSession } from "../services/sessionService";
import { getExerciseLibrary } from "../repositories/exerciseRepo";

export function buildCoachTools(userId: string) {
  const flagPain = betaTool({
    name: "flag_pain",
    description: COACH_TOOLS.flag_pain.description,
    inputSchema: {
      type: "object",
      properties: {
        bodyArea: { type: "string", enum: CONTRAINDICATION_TAGS },
        severity: { type: "string", enum: ["mild", "moderate", "severe"] },
        note: { type: "string" },
      },
      required: ["bodyArea"],
    } as const,
    run: async (input) => {
      const outcome = await flagInjury(userId, input.bodyArea);
      return JSON.stringify({
        bodyArea: input.bodyArea,
        exercisesExcluded: outcome.events.length,
        substitutions: outcome.events.map((e) => ({
          from: e.originalExerciseId,
          to: e.substituteExerciseId,
        })),
      });
    },
  });

  const skipExercise = betaTool({
    name: "skip_exercise",
    description: COACH_TOOLS.skip_exercise.description,
    inputSchema: {
      type: "object",
      properties: {
        exerciseId: { type: "string" },
        reason: { type: "string", enum: SKIP_REASONS },
      },
      required: ["exerciseId", "reason"],
    } as const,
    run: async (input) => {
      if (input.reason === "pain" || input.reason === "too_hard") {
        const outcome = await giveExerciseFeedback(userId, input.exerciseId, input.reason);
        return JSON.stringify({ skipped: input.exerciseId, permanentlySubstituted: true, outcome });
      }
      return JSON.stringify({ skipped: input.exerciseId, permanentlySubstituted: false });
    },
  });

  const shortenSession = betaTool({
    name: "shorten_session",
    description: COACH_TOOLS.shorten_session.description,
    inputSchema: {
      type: "object",
      properties: {
        maxMinutes: { type: "number" },
      },
      required: ["maxMinutes"],
    } as const,
    run: async (input) => {
      const session = await shortenTodaysSession(userId, input.maxMinutes);
      return JSON.stringify(session);
    },
  });

  const getTodaysSessionTool = betaTool({
    name: "get_todays_session",
    description: COACH_TOOLS.get_todays_session.description,
    inputSchema: { type: "object", properties: {} } as const,
    run: async () => {
      const [session, library] = await Promise.all([getTodaysSession(userId), getExerciseLibrary()]);
      if (!session) return JSON.stringify({ session: null });
      const named = session.exercises.map((pe) => ({
        ...pe,
        name: library.find((e) => e.id === pe.exerciseId)?.name ?? pe.exerciseId,
      }));
      return JSON.stringify({ ...session, exercises: named });
    },
  });

  return [flagPain, skipExercise, shortenSession, getTodaysSessionTool];
}
