import { useAuth } from "@clerk/expo";
import { useRef } from "react";
import { createApi, type GetToken } from "./client";

/**
 * A referentially-stable API client for the component's whole lifetime.
 *
 * Clerk's `getToken` isn't guaranteed to keep the same identity across
 * renders. If `useApi()` returned a new client object whenever that
 * happened, every effect keyed on `[api]` (loading a plan on focus,
 * fetching progress, etc.) would re-fire, which re-renders the component,
 * which asks for a new `api` again - an infinite fetch/render loop. Reading
 * the latest `getToken` through a ref means the returned client can stay
 * the same object forever while still always using the current token.
 */
export function useApi() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const apiRef = useRef<ReturnType<typeof createApi> | undefined>(undefined);
  if (!apiRef.current) {
    const stableGetToken: GetToken = () => getTokenRef.current();
    apiRef.current = createApi(stableGetToken);
  }
  return apiRef.current;
}
