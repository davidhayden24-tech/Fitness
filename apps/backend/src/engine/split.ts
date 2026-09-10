import type { MuscleGroup, SplitType } from "@adaptfit/shared";

type ActiveSplitType = Exclude<SplitType, "rest">;

// Beginner-friendly rotation: full-body first so early sessions hit everything,
// then a classic push/pull/legs/core cycle. Cycled to fill user.daysPerWeek.
export const SPLIT_ROTATION: ActiveSplitType[] = ["full_body", "push", "pull", "legs", "core"];

export const SPLIT_MUSCLE_GROUPS: Record<ActiveSplitType, MuscleGroup[]> = {
  push: ["chest", "shoulders", "triceps"],
  pull: ["back", "biceps", "forearms"],
  legs: ["quads", "hamstrings", "glutes", "calves"],
  core: ["abs", "obliques", "lower_back"],
  full_body: ["full_body", "cardio"],
};

export function splitForDayIndex(dayIndex: number): ActiveSplitType {
  return SPLIT_ROTATION[dayIndex % SPLIT_ROTATION.length];
}
