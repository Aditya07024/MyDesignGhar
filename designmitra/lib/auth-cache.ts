import { Platform } from "react-native";

// Web fallback using localStorage when expo-secure-store isn't available
const webTokenCache = {
  async getToken(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
};

// Native implementation using expo-secure-store
const nativeTokenCache = {
  async getToken(key: string) {
    try {
      const SecureStore = require("expo-secure-store");
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      const SecureStore = require("expo-secure-store");
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
};

export const tokenCache = Platform.OS === "web" ? webTokenCache : nativeTokenCache;
