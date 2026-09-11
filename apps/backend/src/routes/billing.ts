import { Router } from "express";
import { z } from "zod";
import { currentUserId, requireUserId } from "../auth/requireUserId";
import { verifyAndApplyAndroidPurchase, SubscriptionVerificationError } from "../services/billingService";
import { UserNotFoundError } from "../services/adaptationService";

export const billingRouter = Router();

const verifySchema = z.object({
  platform: z.enum(["android", "ios"]),
  purchaseToken: z.string().min(1),
});

// Called by the mobile app right after react-native-iap reports a
// successful purchase. Never trust the client's own "I'm subscribed" claim -
// this re-verifies the token against the platform (Google Play here) before
// touching subscriptionStatus.
billingRouter.post("/verify", requireUserId, async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  if (parsed.data.platform === "ios") {
    // App Store Server API verification isn't wired up yet - fail closed
    // rather than silently trusting an unverified client claim.
    return res.status(501).json({ error: "iOS purchase verification is not implemented yet." });
  }

  try {
    const result = await verifyAndApplyAndroidPurchase(currentUserId(res), parsed.data.purchaseToken);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof UserNotFoundError) return res.status(404).json({ error: err.message });
    if (err instanceof SubscriptionVerificationError) return res.status(400).json({ error: err.message });
    throw err;
  }
});
