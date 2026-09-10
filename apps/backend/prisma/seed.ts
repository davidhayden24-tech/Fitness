import { PrismaClient } from "@prisma/client";
import { EXERCISES } from "../src/data/exercises";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${EXERCISES.length} exercises...`);

  for (const exercise of EXERCISES) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      create: {
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        muscleGroups: exercise.muscleGroups,
        equipment: "none",
        difficulty: exercise.difficulty,
        contraindications: exercise.contraindications,
        substituteGroupId: exercise.substituteGroupId,
        videoAssetRef: exercise.videoAssetRef,
        defaultSets: exercise.defaultSets,
        defaultReps: exercise.defaultReps,
        defaultDurationSec: exercise.defaultDurationSeconds,
      },
      update: {
        name: exercise.name,
        description: exercise.description,
        muscleGroups: exercise.muscleGroups,
        difficulty: exercise.difficulty,
        contraindications: exercise.contraindications,
        substituteGroupId: exercise.substituteGroupId,
        videoAssetRef: exercise.videoAssetRef,
        defaultSets: exercise.defaultSets,
        defaultReps: exercise.defaultReps,
        defaultDurationSec: exercise.defaultDurationSeconds,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
