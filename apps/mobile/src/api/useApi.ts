import { useAuth } from "@clerk/expo";
import { useMemo } from "react";
import { createApi } from "./client";

/** A memoized API client bound to the current Clerk session's token getter. */
export function useApi() {
  const { getToken } = useAuth();
  return useMemo(() => createApi(getToken), [getToken]);
}
