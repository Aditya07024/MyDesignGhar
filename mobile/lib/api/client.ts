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

export const API_BASE_URL = `http://${hostIp}:5001/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let sessionToken: string | null = null;

export const setSessionToken = (token: string | null) => {
  sessionToken = token;
};

apiClient.interceptors.request.use(
  (config) => {
    if (sessionToken && config.headers) {
      config.headers.Authorization = `Bearer ${sessionToken}`;
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
