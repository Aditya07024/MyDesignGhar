import Redis from "ioredis";
import { env } from "./env";

export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on("connect", () => {
  console.log("🚀 Connected to Redis successfully");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});
