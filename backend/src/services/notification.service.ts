import { prisma } from "../config/db";
import { logger } from "../utils/logger";
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

const notificationQueue = new Queue("notifications", {
  connection: redisConnection as any,
});

export class NotificationService {
  /**
   * Create database notification and queue email/push alerts
   */
  static async sendNotification(
    userId: string,
    title: string,
    body: string,
    type: "design" | "payment" | "reminder" | "referral"
  ) {
    try {
      // 1. Create database notification record
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          body,
          type,
          isRead: false,
        },
      });

      // 2. Dispatch job to background worker queue to handle email/push asynchronously
      await notificationQueue.add("sendAlert", {
        notificationId: notification.id,
        userId,
        title,
        body,
        type,
      }, {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
      });

      logger.info(`Notification sent to User ${userId}: ${title}`);
      return notification;
    } catch (error: any) {
      logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch unread notifications count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
