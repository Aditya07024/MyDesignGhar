import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Dynamically resolve the Metro host IP address in development to support physical devices
const getHostIp = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const cleanHostUri = hostUri.replace(/^(exp|http|https):\/\//, "");
    return cleanHostUri.split(":")[0];
  }
  // Fallback for other environments/manifests
  const manifest = Constants.manifest2 || (Constants as any).manifest;
  const debuggerHost = manifest?.extra?.expoGo?.debuggerHost || (Constants as any).linkingUri;
  if (debuggerHost) {
    const clean = debuggerHost.replace(/^(exp|http|https):\/\//, "").split("/")[0];
    return clean.split(":")[0];
  }
  return Platform.select({
    android: "10.0.2.2",
    ios: "localhost",
    default: "localhost",
  }) || "localhost";
};

const hostIp = getHostIp();

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${hostIp}:5001/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const tokenRef = {
  getToken: null as (() => Promise<string | null>) | null,
  sessionToken: null as string | null,
};

export const setSessionToken = (token: string | null) => {
  tokenRef.sessionToken = token;
};

apiClient.interceptors.request.use(
  async (config) => {
    let token = tokenRef.sessionToken;
    if (tokenRef.getToken) {
      try {
        const freshToken = await tokenRef.getToken();
        if (freshToken) {
          token = freshToken;
          tokenRef.sessionToken = token;
        }
      } catch (err) {
        console.warn("Failed to refresh Clerk token in interceptor:", err);
      }
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setSessionToken(null);
    }
    return Promise.reject(error);
  }
);

export const resolveImageUri = (rawUrl: string | undefined): string => {
  if (!rawUrl) return "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600";
  
  let imageUri = rawUrl;
  if (!rawUrl.startsWith("http")) {
    imageUri = `${API_BASE_URL.replace("/api", "")}/uploads/previews/${rawUrl}`;
  } else {
    const apiBaseDomain = API_BASE_URL.replace("/api", "");
    imageUri = rawUrl.replace(/http:\/\/(localhost|127\.0\.0\.1):5001/g, apiBaseDomain)
                      .replace(/http:\/\/(localhost|127\.0\.0\.1):3000/g, apiBaseDomain)
                      .replace(/http:\/\/(localhost|127\.0\.0\.1):5000/g, apiBaseDomain);
  }
  return imageUri;
};
