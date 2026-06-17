import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { logger } from "../utils/logger";
import { prisma } from "../config/db";

// 1. Notification worker: simulated email and push deliveries
const notificationWorker = new Worker(
  "notifications",
  async (job: Job) => {
    const { notificationId, userId, title, body, type } = job.data;
    logger.info(`[Worker: Notifications] Processing notification ${notificationId} for User ${userId}`);

    // Fetch user details for notification channels
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Email dispatch simulation
    if (user.email) {
      logger.info(`[SMTP Mock] Email sent to ${user.email} - Subject: ${title} - Body: ${body}`);
    }

    // Push notification dispatch simulation
    logger.info(`[Push Service Mock] Push notification sent to User ${userId} device`);
  },
  { connection: redisConnection as any }
);

// 2. Image generation & HD rerender worker
const imageWorker = new Worker(
  "image-tasks",
  async (job: Job) => {
    const { designId, action } = job.data;
    logger.info(`[Worker: Image Tasks] Processing ${action} for Design ${designId}`);

    if (action === "hd-rerender") {
      // Simulation of an upscale operation using sharp
      logger.info(`[Upscaling Service Mock] High-definition upscaling applied to Design ${designId}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  },
  { connection: redisConnection as any }
);

// 3. Analytics aggregation worker
const analyticsWorker = new Worker(
  "analytics-aggregation",
  async (job: Job) => {
    logger.info(`[Worker: Analytics] Running daily active/monthly active user rollup for job ${job.id}...`);
    
    const today = new Date().toISOString().split("T")[0];

    // Count daily generations
    const generationsCount = await prisma.design.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    logger.info(`[Worker: Analytics] Rollup finished for ${today}: Generates = ${generationsCount}`);
  },
  { connection: redisConnection as any }
);

// Error handlers
notificationWorker.on("failed", (job, err) => {
  logger.error(`[Worker: Notifications] Job ${job?.id} failed: ${err.message}`);
});

imageWorker.on("failed", (job, err) => {
  logger.error(`[Worker: Image Tasks] Job ${job?.id} failed: ${err.message}`);
});

analyticsWorker.on("failed", (job, err) => {
  logger.error(`[Worker: Analytics] Job ${job?.id} failed: ${err.message}`);
});

export function startWorkers() {
  logger.info("⚙️ BullMQ background workers initialized and listening");
}
