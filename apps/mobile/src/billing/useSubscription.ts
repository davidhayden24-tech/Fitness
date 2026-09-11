import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useIAP, type ProductSubscriptionAndroid } from "react-native-iap";
import { ADAPTFIT_PLUS_SKU } from "@adaptfit/shared";
import { useApi } from "../api/useApi";

export type SubscribeState = "idle" | "purchasing" | "verifying" | "error";

// Android-only for now (see routes/billing.ts on the backend, which fails
// closed with 501 for iOS - App Store Server API verification isn't wired
// up yet). Nothing here can be exercised outside a real device/Play Store
// build: Expo web and the sandbox have no native IAP module to talk to.
export function useSubscription(onVerified?: () => void) {
  const api = useApi();
  const [state, setState] = useState<SubscribeState>("idle");
  const [error, setError] = useState<string | null>(null);
  const verifyingTokenRef = useRef<string | null>(null);

  const { connected, subscriptions, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      const token = purchase.purchaseToken;
      if (!token || verifyingTokenRef.current === token) return;
      verifyingTokenRef.current = token;
      setState("verifying");
      try {
        await api.verifySubscriptionPurchase("android", token);
        await finishTransaction({ purchase, isConsumable: false });
        setError(null);
        setState("idle");
        onVerified?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "We couldn't confirm your purchase.");
        setState("error");
      } finally {
        verifyingTokenRef.current = null;
      }
    },
    onPurchaseError: (err) => {
      setError(err.message || "Purchase failed.");
      setState("error");
    },
  });

  useEffect(() => {
    if (!connected || Platform.OS !== "android") return;
    fetchProducts({ skus: [ADAPTFIT_PLUS_SKU], type: "subs" }).catch((err) => {
      setError(err instanceof Error ? err.message : "Could not load subscription options.");
    });
  }, [connected, fetchProducts]);

  const plan = subscriptions.find(
    (s): s is ProductSubscriptionAndroid => s.platform === "android" && s.id === ADAPTFIT_PLUS_SKU
  );

  const subscribe = useCallback(async () => {
    if (Platform.OS !== "android") {
      setError("Subscribing from this device isn't supported yet.");
      setState("error");
      return;
    }
    const offerToken = plan?.subscriptionOffers[0]?.offerTokenAndroid;
    if (!plan || !offerToken) {
      setError("Subscription option isn't available yet - try again shortly.");
      setState("error");
      return;
    }
    setError(null);
    setState("purchasing");
    try {
      await requestPurchase({
        request: {
          google: {
            skus: [ADAPTFIT_PLUS_SKU],
            subscriptionOffers: [{ sku: ADAPTFIT_PLUS_SKU, offerToken }],
          },
        },
        type: "subs",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed.");
      setState("error");
    }
  }, [plan, requestPurchase]);

  return {
    isAndroid: Platform.OS === "android",
    displayPrice: plan?.displayPrice ?? null,
    state,
    error,
    subscribe,
  };
}
