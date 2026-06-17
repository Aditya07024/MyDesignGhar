import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { clerkMiddleware } from "@clerk/express";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import apiRouter from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { apiLimiter } from "./middlewares/rate-limit.middleware";

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: [
      env.FRONTEND_URL,
      env.ADMIN_URL,
      "http://localhost:8081",  // Expo web dev server
      "http://localhost:19006", // Expo web (alt port)
    ].filter(Boolean),
    credentials: true,
  })
);

// Serve public storage folders statically
app.use("/uploads/previews", express.static(path.join(process.cwd(), "uploads/previews")));
app.use("/uploads/thumbnails", express.static(path.join(process.cwd(), "uploads/thumbnails")));
app.use("/uploads/depthmaps", express.static(path.join(process.cwd(), "uploads/depthmaps")));

app.use(clerkMiddleware({ debug: true }));

// General Rate Limiter
app.use("/api", apiLimiter);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Interactive API Documentation via Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base status route
app.get("/status", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// App Router
app.use("/api", apiRouter);

// Standard 404 Route handler
app.use((_req, res) => {
  res.status(404).json({ message: "API Route not found" });
});

// Global Error Handler
app.use(errorHandler);

export default app;
