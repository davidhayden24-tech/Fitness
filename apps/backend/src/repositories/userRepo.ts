import type {
  ContraindicationTag,
  Difficulty,
  FitnessLevel,
  Goal,
  SubscriptionStatus,
  User,
} from "@adaptfit/shared";
import { prisma } from "../db";
import type { MinimalUserState } from "../engine/substitution";

function toUser(row: {
  id: string;
  email: string;
  fitnessLevel: string;
  goals: string[];
  flaggedInjuries: string[];
  excludedExerciseIds: string[];
  minutesPerSession: number;
  daysPerWeek: number;
  subscriptionStatus: string;
  subscriptionExpiresAt: Date | null;
  coachMemorySummary: string | null;
}): User {
  return {
    id: row.id,
    email: row.email,
    fitnessLevel: row.fitnessLevel as FitnessLevel,
    goals: row.goals as Goal[],
    flaggedInjuries: row.flaggedInjuries as ContraindicationTag[],
    excludedExerciseIds: row.excludedExerciseIds,
    minutesPerSession: row.minutesPerSession,
    daysPerWeek: row.daysPerWeek,
    subscriptionStatus: row.subscriptionStatus as SubscriptionStatus,
    subscriptionExpiresAt: row.subscriptionExpiresAt?.toISOString() ?? null,
    coachMemorySummary: row.coachMemorySummary,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const row = await prisma.user.findUnique({ where: { id } });
  return row ? toUser(row) : null;
}

export function toMinimalUserState(user: User): MinimalUserState & {
  daysPerWeek: number;
  minutesPerSession: number;
} {
  return {
    fitnessLevel: user.fitnessLevel as Difficulty,
    flaggedInjuries: user.flaggedInjuries,
    excludedExerciseIds: user.excludedExerciseIds,
    daysPerWeek: user.daysPerWeek,
    minutesPerSession: user.minutesPerSession,
  };
}

export interface OnboardingInput {
  fitnessLevel: FitnessLevel;
  goals: Goal[];
  flaggedInjuries: ContraindicationTag[];
  minutesPerSession?: number;
  daysPerWeek?: number;
}

/**
 * Creates or updates the app-profile row for an already-authenticated Clerk
 * user. `id` and `email` come from the verified Clerk session/user object
 * (see routes/users.ts), never from client-supplied body fields - the body
 * only carries onboarding answers.
 */
export async function upsertUserProfile(
  id: string,
  email: string,
  input: OnboardingInput
): Promise<User> {
  const data = {
    email,
    fitnessLevel: input.fitnessLevel,
    goals: input.goals,
    flaggedInjuries: input.flaggedInjuries,
    minutesPerSession: input.minutesPerSession ?? 30,
    daysPerWeek: input.daysPerWeek ?? 4,
  };
  const row = await prisma.user.upsert({
    where: { id },
    create: { id, excludedExerciseIds: [], ...data },
    update: data,
  });
  return toUser(row);
}

export async function applyAdaptationToUser(
  userId: string,
  updatedExcludedExerciseIds: string[],
  updatedFlaggedInjuries: ContraindicationTag[]
): Promise<User> {
  const row = await prisma.user.update({
    where: { id: userId },
    data: {
      excludedExerciseIds: updatedExcludedExerciseIds,
      flaggedInjuries: updatedFlaggedInjuries,
    },
  });
  return toUser(row);
}
