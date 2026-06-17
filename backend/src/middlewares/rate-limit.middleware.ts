import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "development" ? 5000 : 100, // Allow 5000 requests in development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === "development" ? 1000 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication requests, please try again after an hour.",
  },
});

export const aiGenerateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "development" ? 500 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "AI generation rate limit reached, please try again after 15 minutes.",
  },
});
