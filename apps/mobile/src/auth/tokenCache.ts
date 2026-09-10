import * as SecureStore from "expo-secure-store";
import type { TokenCache } from "@clerk/expo";

// Persists Clerk's session JWT in the platform keychain/keystore instead of
// Clerk's in-memory default, so a signed-in user stays signed in across app
// restarts. SecureStore is unavailable on web; Clerk falls back to its
// default in-memory cache there when getToken/saveToken throw.
export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore - falls back to session-only auth
    }
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};
