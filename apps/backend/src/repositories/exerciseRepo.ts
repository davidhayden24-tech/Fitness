import type {
  ContraindicationTag,
  Difficulty,
  Exercise,
  MuscleGroup,
} from "@adaptfit/shared";
import { prisma } from "../db";

function toExercise(row: {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string;
  difficulty: string;
  contraindications: string[];
  substituteGroupId: string;
  videoAssetRef: string | null;
  defaultSets: number | null;
  defaultReps: number | null;
  defaultDurationSec: number | null;
}): Exercise {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    muscleGroups: row.muscleGroups as MuscleGroup[],
    equipment: "none",
    difficulty: row.difficulty as Difficulty,
    contraindications: row.contraindications as ContraindicationTag[],
    substituteGroupId: row.substituteGroupId,
    videoAssetRef: row.videoAssetRef,
    defaultSets: row.defaultSets,
    defaultReps: row.defaultReps,
    defaultDurationSeconds: row.defaultDurationSec,
  };
}

let cache: Exercise[] | null = null;

/**
 * The exercise library is small (~100 rows) and changes rarely, so the
 * substitution engine and plan generator work against an in-memory array
 * rather than re-querying Postgres per lookup. Call `invalidateExerciseCache`
 * after writes to the Exercise table (e.g. an admin content update).
 */
export async function getExerciseLibrary(): Promise<Exercise[]> {
  if (cache) return cache;
  const rows = await prisma.exercise.findMany();
  cache = rows.map(toExercise);
  return cache;
}

export function invalidateExerciseCache(): void {
  cache = null;
}
