import { describe, expect, it } from "vitest";
import type { ContraindicationTag } from "@adaptfit/shared";
import { generateWeeklyPlan } from "../src/engine/planGenerator";
import { applyInjuryFlag } from "../src/engine/substitution";
import { TEST_LIBRARY, findExercise } from "./testLibrary";

describe("generateWeeklyPlan", () => {
  const baseUser = {
    fitnessLevel: "beginner" as const,
    flaggedInjuries: [] as ContraindicationTag[],
    excludedExerciseIds: [] as string[],
    daysPerWeek: 5,
    minutesPerSession: 30,
  };

  it("produces one session per requested day, following the push/pull/legs/core/full-body rotation", () => {
    const sessions = generateWeeklyPlan({ user: { ...baseUser, flaggedInjuries: [] }, library: TEST_LIBRARY, weekNumber: 1 });
    expect(sessions).toHaveLength(5);
    expect(sessions.map((s) => s.splitType)).toEqual(["full_body", "push", "pull", "legs", "core"]);
  });

  it("never schedules an excluded or contraindicated exercise anywhere in the week", () => {
    const user = { ...baseUser, flaggedInjuries: ["knee" as const] };
    const sessions = generateWeeklyPlan({ user, library: TEST_LIBRARY, weekNumber: 1 });

    for (const session of sessions) {
      for (const planned of session.exercises) {
        const exercise = findExercise(planned.exerciseId);
        expect(exercise.contraindications).not.toContain("knee");
      }
    }
  });

  it("full flow: flagging a knee injury mid-program permanently reroutes every future week, not just one day", () => {
    // Week 1: no injuries flagged yet - a healthy plan will very likely
    // include at least one knee-loading exercise (squats/lunges/etc.).
    const week1 = generateWeeklyPlan({ user: baseUser, library: TEST_LIBRARY, weekNumber: 1 });
    const week1ExerciseIds = week1.flatMap((s) => s.exercises.map((e) => e.exerciseId));
    const week1HasKneeExercise = week1ExerciseIds.some((id) =>
      findExercise(id).contraindications.includes("knee")
    );
    expect(week1HasKneeExercise).toBe(true);

    // User flags knee pain after week 1.
    const adaptation = applyInjuryFlag("knee", TEST_LIBRARY, {
      fitnessLevel: baseUser.fitnessLevel,
      flaggedInjuries: [...baseUser.flaggedInjuries],
      excludedExerciseIds: [...baseUser.excludedExerciseIds],
    });
    expect(adaptation.updatedFlaggedInjuries).toContain("knee");

    const adaptedUser = {
      ...baseUser,
      flaggedInjuries: adaptation.updatedFlaggedInjuries,
      excludedExerciseIds: adaptation.updatedExcludedExerciseIds,
    };

    // Weeks 2 and 3 (a full future stretch of the program) must both be
    // clean of knee-loading exercises - proving the reroute is permanent,
    // not a one-day skip.
    for (const weekNumber of [2, 3]) {
      const week = generateWeeklyPlan({ user: adaptedUser, library: TEST_LIBRARY, weekNumber });
      const exerciseIds = week.flatMap((s) => s.exercises.map((e) => e.exerciseId));
      for (const id of exerciseIds) {
        expect(findExercise(id).contraindications).not.toContain("knee");
      }
    }
  });

  it("sizes sessions to roughly fit the user's available minutes", () => {
    const shortUser = { ...baseUser, minutesPerSession: 12 };
    const longUser = { ...baseUser, minutesPerSession: 40 };
    const shortSessions = generateWeeklyPlan({ user: shortUser, library: TEST_LIBRARY, weekNumber: 1 });
    const longSessions = generateWeeklyPlan({ user: longUser, library: TEST_LIBRARY, weekNumber: 1 });

    const avgShort =
      shortSessions.reduce((sum, s) => sum + s.exercises.length, 0) / shortSessions.length;
    const avgLong =
      longSessions.reduce((sum, s) => sum + s.exercises.length, 0) / longSessions.length;

    expect(avgShort).toBeLessThan(avgLong);
  });
});
