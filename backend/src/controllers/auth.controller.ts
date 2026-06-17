import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { ReferralService } from "../services/referral.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { NotificationService } from "../services/notification.service";
import { logger } from "../utils/logger";

export class AuthController {
  /**
   * Sync Clerk authenticated user with Postgres database
   */
  static async sync(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const clerkId = req.user!.clerkId || (req as any).user?.clerkId;
      const userId = req.user!.id;
      const { referralCode, role } = req.body;

      logger.info(`Syncing profile metadata for User ${userId}...`);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, wallet: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User profile sync target not found" });
      }

      let activeUser = user;
      if (!user.isRoleLocked && role && (role === "USER" || role === "CONSULTANT")) {
        activeUser = await prisma.user.update({
          where: { id: userId },
          data: {
            role: role as any,
            isRoleLocked: true,
          },
          include: { profile: true, wallet: true },
        });
        logger.info(`Locked role as ${role} for User ${userId}`);
      }

      // If they passed a referral code and do not have an invite record, process referral bonus
      if (referralCode) {
        const existingReferral = await prisma.referral.findUnique({
          where: { refereeId: userId },
        });

        if (!existingReferral) {
          await ReferralService.processReferral(userId, referralCode);
        }
      }

      return res.json({
        message: "Profile synced successfully",
        user: {
          id: activeUser.id,
          phone: activeUser.phone,
          email: activeUser.email,
          role: activeUser.role,
          fullName: activeUser.profile?.fullName || "User",
          walletBalance: activeUser.wallet?.balance || 0,
          referralCode: activeUser.referralCode,
          isPhoneVerified: activeUser.isPhoneVerified,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch current authenticated user info
   */
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, wallet: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User profile not found" });
      }

      return res.json({
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          role: user.role,
          fullName: user.profile?.fullName || "User",
          walletBalance: user.wallet?.balance || 0,
          referralCode: user.referralCode,
          isPhoneVerified: user.isPhoneVerified,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { fullName, phone, bio, avatarUrl } = req.body;

      if (phone) {
        const existing = await prisma.user.findFirst({
          where: {
            phone,
            id: { not: userId },
          },
        });
        if (existing) {
          return res.status(400).json({ message: "This phone number is already associated with another account." });
        }

        await prisma.user.update({
          where: { id: userId },
          data: { phone, isPhoneVerified: true },
        });
      }

      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: {
          fullName,
          bio,
          avatarUrl,
        },
      });

      try {
        await NotificationService.sendNotification(
          userId,
          "Profile Updated",
          "Your profile details have been successfully updated.",
          "reminder"
        );
      } catch (nErr: any) {
        logger.error(`Notification trigger failed during profile update: ${nErr.message}`);
      }

      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, wallet: true },
      });

      return res.json({
        message: "Profile updated successfully",
        profile: updatedProfile,
        user: updatedUser ? {
          id: updatedUser.id,
          phone: updatedUser.phone,
          email: updatedUser.email,
          role: updatedUser.role,
          fullName: updatedUser.profile?.fullName || "User",
          walletBalance: updatedUser.wallet?.balance || 0,
          referralCode: updatedUser.referralCode,
          isPhoneVerified: updatedUser.isPhoneVerified,
        } : undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account (Soft Delete)
   */
  static async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      logger.info(`User soft-deleted account: ${userId}`);
      return res.json({ message: "Account deleted successfully in database" });
    } catch (error) {
      next(error);
    }
  }
}
