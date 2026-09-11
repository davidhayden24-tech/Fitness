// Verifies Android subscription purchases against the Google Play Developer
// API. Uses purchases.subscriptionsv2.get (the current API - the v1
// purchases.subscriptions.get endpoint it replaced is deprecated), verified
// against the actual generated types in the `googleapis` package rather
// than assumed from memory.
//
// Requires a Google Cloud service account with access to the Play Console
// (Play Console -> Setup -> API access -> link/create a service account,
// grant it "View financial data" + "Manage orders and subscriptions"), with
// its JSON key supplied via GOOGLE_PLAY_SERVICE_ACCOUNT_JSON (the raw JSON
// content, not a file path - convenient for hosts like Render where
// mounting a file is awkward).
import { google } from "googleapis";

// States where the user should currently have access. Google grants access
// through grace periods while a renewal payment retries; ON_HOLD and beyond
// should not grant access. See the state diagram in Play Console's docs -
// this list is inferred from RTDN/subscriptionsv2 conventions, not fetched
// from live docs (network access to developers.google.com was unavailable
// while building this) - re-confirm against Google's current guidance
// before relying on it for a paid feature.
const ENTITLED_STATES = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"]);

export interface VerifiedSubscription {
  isEntitled: boolean;
  productId: string | null;
  expiresAt: Date | null;
  rawState: string | null;
}

function getAuth() {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not set - Android purchase verification is unavailable.");
  }
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });
}

/**
 * @param packageName The app's Android package name (e.g. "com.adaptfit.app") -
 *   never taken from client input, always our own known value.
 * @param purchaseToken The token the client got from Play Billing at purchase time.
 */
export async function verifyAndroidSubscription(
  packageName: string,
  purchaseToken: string
): Promise<VerifiedSubscription> {
  const auth = getAuth();
  const androidpublisher = google.androidpublisher({ version: "v3", auth });

  const { data } = await androidpublisher.purchases.subscriptionsv2.get({
    packageName,
    token: purchaseToken,
  });

  const lineItem = data.lineItems?.[0];
  const rawState = data.subscriptionState ?? null;
  const expiresAt = lineItem?.expiryTime ? new Date(lineItem.expiryTime) : null;

  return {
    isEntitled: rawState !== null && ENTITLED_STATES.has(rawState),
    productId: lineItem?.productId ?? null,
    expiresAt,
    rawState,
  };
}
