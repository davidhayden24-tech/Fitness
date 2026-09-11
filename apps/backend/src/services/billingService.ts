import { ADAPTFIT_PLUS_SKU } from "@adaptfit/shared";
import { prisma } from "../db";
import { verifyAndroidSubscription } from "../billing/googlePlay";
import { UserNotFoundError } from "./adaptationService";

const ANDROID_PACKAGE_NAME = "com.adaptfit.app";

export class SubscriptionVerificationError extends Error {}

export interface SubscriptionResult {
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
}

/**
 * Verifies a purchase token against Google Play, then records the result on
 * the user - this is the only place subscriptionStatus is ever set to
 * "active". The mobile client's paywall UI and even the coach route's own
 * check are just conveniences; this function (driven by a token Google
 * itself issued) is the actual source of truth.
 */
export async function verifyAndApplyAndroidPurchase(
  userId: string,
  purchaseToken: string
): Promise<SubscriptionResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new UserNotFoundError(userId);

  // A purchase token must not be claimable by more than one account.
  const existingOwner = await prisma.user.findUnique({ where: { subscriptionPurchaseToken: purchaseToken } });
  if (existingOwner && existingOwner.id !== userId) {
    throw new SubscriptionVerificationError("This purchase is already linked to a different account.");
  }

  const verified = await verifyAndroidSubscription(ANDROID_PACKAGE_NAME, purchaseToken);

  if (verified.productId !== ADAPTFIT_PLUS_SKU) {
    throw new SubscriptionVerificationError(
      `Purchase is for an unrecognized product (${verified.productId ?? "unknown"}).`
    );
  }

  const subscriptionStatus = verified.isEntitled ? "active" : "canceled";

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus,
      subscriptionProductId: verified.productId,
      subscriptionExpiresAt: verified.expiresAt,
      subscriptionPurchaseToken: purchaseToken,
    },
  });

  return {
    subscriptionStatus: updated.subscriptionStatus,
    subscriptionExpiresAt: updated.subscriptionExpiresAt?.toISOString() ?? null,
  };
}
