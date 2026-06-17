import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10).optional(),
  JWT_REFRESH_SECRET: z.string().min(10).optional(),
  CLERK_PUBLISHABLE_KEY: z.string().min(5),
  CLERK_SECRET_KEY: z.string().min(5),
  BACKEND_URL: z.string().url().default("http://localhost:5000"),
  REDIS_URL: z.string().url().default("redis://127.0.0.1:6379"),
  RAZORPAY_KEY_ID: z.string().min(5),
  RAZORPAY_KEY_SECRET: z.string().min(5),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(5),
  POLLINATIONS_API_URL: z.string().url().default("https://image.pollinations.ai"),
  HF_API_KEY: z.string().optional(),
  PRODIA_API_KEY: z.string().optional(),
  LIVEKIT_URL: z.string().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_URL: z.string().url().default("http://localhost:3001"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
