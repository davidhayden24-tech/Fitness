// Single source of truth for the subscription product identifier, shared
// between the mobile purchase flow and the backend's verification endpoint.
// This must exactly match the subscription product ID configured in Google
// Play Console (and, if/when iOS is wired up, App Store Connect).
export const ADAPTFIT_PLUS_SKU = "adaptfit_plus_monthly";

export type BillingPlatform = "android" | "ios";
