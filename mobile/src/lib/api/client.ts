import axios from "axios";

// Default base URL pointing to the Node/Express backend
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (typeof window !== "undefined"
  ? (window.location.hostname === "localhost" ? "http://localhost:5001/api" : "/api")
  : "http://localhost:5001/api");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Allow cookies to be sent
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token from Clerk if exists
apiClient.interceptors.request.use(
  async (config: any) => {
    if (typeof window !== "undefined") {
      let token = localStorage.getItem("clerk_session_token");

      // Check if Clerk object exists globally on client side
      if ((window as any).Clerk?.session) {
        try {
          const freshToken = await (window as any).Clerk.session.getToken();
          if (freshToken) {
            token = freshToken;
            localStorage.setItem("clerk_session_token", freshToken);
          }
        } catch (err) {
          console.error("Failed to fetch fresh Clerk token:", err);
        }
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response Interceptor: Redirect or handle 401 failures
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("clerk_session_token");
      }
    }
    return Promise.reject(error);
  }
);
