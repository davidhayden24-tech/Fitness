import { describe, expect, it } from "vitest";
import {
  applyExerciseFeedback,
  applyInjuryFlag,
  findSubstitute,
  isContraindicated,
  isEligible,
} from "../src/engine/substitution";
import { TEST_LIBRARY, findExercise } from "./testLibrary";
import type { MinimalUserState } from "../src/engine/substitution";

function baseUser(overrides: Partial<MinimalUserState> = {}): MinimalUserState {
  return {
    fitnessLevel: "beginner",
    flaggedInjuries: [],
    excludedExerciseIds: [],
    ...overrides,
  };
}

describe("isContraindicated / isEligible", () => {
  it("flags an exercise as contraindicated when its tags overlap flagged injuries", () => {
    const squat = findExercise("bodyweight_squat");
    expect(isContraindicated(squat, ["knee"])).toBe(true);
    expect(isContraindicated(squat, ["shoulder"])).toBe(false);
    expect(isContraindicated(squat, [])).toBe(false);
  });

  it("treats an excluded exercise as ineligible even without a contraindication", () => {
    const squat = findExercise("bodyweight_squat");
    const user = baseUser({ excludedExerciseIds: [squat.id] });
    expect(isEligible(squat, user)).toBe(false);
  });
});

describe("findSubstitute", () => {
  it("prefers a same substitute-group exercise that is not contraindicated", () => {
    const squat = findExercise("bodyweight_squat");
    const user = baseUser({ flaggedInjuries: ["knee"] });
    const sub = findSubstitute(squat, TEST_LIBRARY, user);
    expect(sub).not.toBeNull();
    expect(sub!.id).not.toBe(squat.id);
    expect(sub!.substituteGroupId).toBe(squat.substituteGroupId);
    expect(sub!.contraindications).not.toContain("knee");
  });

  it("falls back to a same-muscle-group exercise when the substitute group has no safe option", () => {
    // diamond_pushup is the only member of push_horizontal_triceps, so a
    // like-for-like swap must come from the broader triceps muscle group.
    const diamond = findExercise("diamond_pushup");
    const user = baseUser();
    const sub = findSubstitute(diamond, TEST_LIBRARY, user);
    expect(sub).not.toBeNull();
    expect(sub!.substituteGroupId).not.toBe(diamond.substituteGroupId);
    expect(sub!.muscleGroups.some((mg) => diamond.muscleGroups.includes(mg))).toBe(true);
  });

  it("never returns a substitute that is itself contraindicated for the user", () => {
    const crunch = findExercise("crunch");
    const user = baseUser({ flaggedInjuries: ["lower_back"] });
    const sub = findSubstitute(crunch, TEST_LIBRARY, user);
    expect(sub).not.toBeNull();
    expect(sub!.contraindications).not.toContain("lower_back");
  });

  it("returns null when no eligible substitute exists anywhere in the library", () => {
    const tinyLibrary = TEST_LIBRARY.filter((e) => e.id === "bodyweight_squat");
    const squat = findExercise("bodyweight_squat");
    const user = baseUser({ flaggedInjuries: ["knee"] });
    expect(findSubstitute(squat, tinyLibrary, user)).toBeNull();
  });

  it("is deterministic given the same inputs", () => {
    const squat = findExercise("bodyweight_squat");
    const user = baseUser({ flaggedInjuries: ["knee"] });
    const a = findSubstitute(squat, TEST_LIBRARY, user);
    const b = findSubstitute(squat, TEST_LIBRARY, user);
    expect(a?.id).toBe(b?.id);
  });
});

describe("applyInjuryFlag", () => {
  it("permanently excludes every exercise contraindicated for the flagged body area", () => {
    const user = baseUser();
    const result = applyInjuryFlag("knee", TEST_LIBRARY, user);

    const kneeExercises = TEST_LIBRARY.filter((e) => e.contraindications.includes("knee"));
    for (const kneeExercise of kneeExercises) {
      expect(result.updatedExcludedExerciseIds).toContain(kneeExercise.id);
    }
  });

  it("records the flagged body area on the user going forward", () => {
    const user = baseUser();
    const result = applyInjuryFlag("shoulder", TEST_LIBRARY, user);
    expect(result.updatedFlaggedInjuries).toContain("shoulder");
  });

  it("produces an AdaptationEvent with a safe substitute for every affected exercise that has one", () => {
    const user = baseUser();
    const result = applyInjuryFlag("knee", TEST_LIBRARY, user);

    expect(result.events.length).toBeGreaterThan(0);
    for (const event of result.events) {
      expect(event.trigger).toBe("injury_flag");
      expect(event.contraindicationTag).toBe("knee");
      const substitute = findExercise(event.substituteExerciseId);
      expect(substitute.contraindications).not.toContain("knee");
      expect(result.updatedExcludedExerciseIds).not.toContain(substitute.id);
    }
  });

  it("is idempotent - re-flagging the same body area does not duplicate exclusions", () => {
    const user = baseUser();
    const first = applyInjuryFlag("knee", TEST_LIBRARY, user);
    const second = applyInjuryFlag("knee", TEST_LIBRARY, {
      ...user,
      flaggedInjuries: first.updatedFlaggedInjuries,
      excludedExerciseIds: first.updatedExcludedExerciseIds,
    });
    expect(second.events).toHaveLength(0);
    expect(new Set(second.updatedExcludedExerciseIds).size).toBe(
      second.updatedExcludedExerciseIds.length
    );
  });
});

describe("applyExerciseFeedback", () => {
  it("permanently excludes a single exercise the user marked as painful", () => {
    const user = baseUser();
    const result = applyExerciseFeedback("standard_pushup", "pain", TEST_LIBRARY, user);
    expect(result.updatedExcludedExerciseIds).toContain("standard_pushup");
  });

  it("does not add the flagged body-area list for a one-off thumbs-down (only injury_flag does)", () => {
    const user = baseUser();
    const result = applyExerciseFeedback("standard_pushup", "dislike", TEST_LIBRARY, user);
    expect(result.updatedFlaggedInjuries).toEqual(user.flaggedInjuries);
  });

  it("finds a muscle-group-equivalent substitute and logs a thumbs_down AdaptationEvent", () => {
    const user = baseUser();
    const result = applyExerciseFeedback("standard_pushup", "pain", TEST_LIBRARY, user);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].trigger).toBe("thumbs_down");
    expect(result.events[0].originalExerciseId).toBe("standard_pushup");
    const substitute = findExercise(result.events[0].substituteExerciseId);
    expect(substitute.muscleGroups.some((mg) => ["chest", "shoulders", "triceps"].includes(mg))).toBe(
      true
    );
  });
});
