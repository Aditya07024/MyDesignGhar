import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/db";
import { startWorkers } from "./queues/workers";
import { logger } from "./utils/logger";

async function bootstrap() {
  try {
    // 1. Establish database connection
    logger.info("Connecting to PostgreSQL...");
    await prisma.$connect();
    logger.info("🚀 Database connection established successfully");

    // 2. Start BullMQ Background Workers
    startWorkers();

    // 3. Start Express listener
    app.listen(env.PORT, () => {
      logger.info(`🔥 Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
      logger.info(`📖 API Documentation available at http://localhost:${env.PORT}/api-docs`);
    });
  } catch (error: any) {
    logger.error(`Fatal error during server bootstrap: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
