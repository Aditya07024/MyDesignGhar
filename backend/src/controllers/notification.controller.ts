import { Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";

export class NotificationController {
  /**
   * Fetch all notifications for the current user
   */
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      let notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (notifications.length === 0) {
        const isConsultant = req.user!.role === "CONSULTANT";
        const initialNotifications = isConsultant ? [
          {
            title: "Welcome to the Expert Panel!",
            body: "Complete your profile bio and set your range availability slots so homeowners can book your sessions.",
            type: "reminder",
          },
          {
            title: "How booking payouts work",
            body: "Homeowners pay using their wallets. Your consultation fees will be credited to your Earnings instantly on completion.",
            type: "payment",
          },
          {
            title: "Video consultations info",
            body: "Join confirmed video consultation rooms securely directly from your schedule in the home dashboard.",
            type: "reminder",
          },
        ] : [
          {
            title: "Your design is ready!",
            body: "3 new Rajasthan living room designs are waiting.",
            type: "design",
          },
          {
            title: "Payment successful",
            body: "₹999 added to your wallet.",
            type: "payment",
          },
          {
            title: "Welcome to MyDesignGhar",
            body: "Get started by generating your first AI room layout or booking an expert consultation.",
            type: "reminder",
          },
        ];

        await prisma.notification.createMany({
          data: initialNotifications.map((n) => ({
            userId,
            title: n.title,
            body: n.body,
            type: n.type,
            isRead: false,
          })),
        });

        notifications = await prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
      }

      return res.json({ notifications });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all unread notifications as read
   */
  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await NotificationService.markAllAsRead(userId);
      return res.json({ message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await prisma.notification.updateMany({
        where: { id, userId, isRead: false },
        data: { isRead: true },
      });

      return res.json({ message: "Notification marked as read" });
    } catch (error) {
      next(error);
    }
  }
}
