import type { Exercise } from "@adaptfit/shared";
import { EXERCISES } from "../src/data/exercises";

export const TEST_LIBRARY: Exercise[] = EXERCISES.map((e) => ({
  ...e,
  equipment: "none" as const,
}));

export function findExercise(id: string): Exercise {
  const found = TEST_LIBRARY.find((e) => e.id === id);
  if (!found) throw new Error(`Test fixture missing exercise: ${id}`);
  return found;
}
