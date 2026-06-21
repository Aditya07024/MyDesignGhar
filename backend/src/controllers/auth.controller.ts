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
        include: {
          profile: true,
          wallet: true,
          consultantProfile: {
            include: {
              reviews: { select: { rating: true } },
              availability: { orderBy: { date: "asc" } }
            }
          }
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User profile sync target not found" });
      }

      let activeUser = user;
      if (role === "ADMIN") {
        activeUser = await prisma.user.update({
          where: { id: userId },
          data: {
            role: "ADMIN",
            isRoleLocked: true,
          },
          include: {
            profile: true,
            wallet: true,
            consultantProfile: {
              include: {
                reviews: { select: { rating: true } },
                availability: { orderBy: { date: "asc" } }
              }
            }
          },
        });
        logger.info(`Locked role as ADMIN for User ${userId}`);
      } else if (!user.isRoleLocked && role && (role === "USER" || role === "CONSULTANT")) {
        activeUser = await prisma.user.update({
          where: { id: userId },
          data: {
            role: role as any,
            isRoleLocked: true,
          },
          include: {
            profile: true,
            wallet: true,
            consultantProfile: {
              include: {
                reviews: { select: { rating: true } },
                availability: { orderBy: { date: "asc" } }
              }
            }
          },
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
          consultantProfile: activeUser.consultantProfile ? {
            id: activeUser.consultantProfile.id,
            status: activeUser.consultantProfile.status,
            isApproved: activeUser.consultantProfile.isApproved,
            specialty: activeUser.consultantProfile.specialty,
            experience: activeUser.consultantProfile.experience,
            bio: activeUser.consultantProfile.bio,
            price: activeUser.consultantProfile.price,
            rating: (activeUser.consultantProfile as any).reviews && (activeUser.consultantProfile as any).reviews.length > 0
              ? parseFloat(((activeUser.consultantProfile as any).reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / (activeUser.consultantProfile as any).reviews.length).toFixed(1))
              : 5.0,
            availability: (activeUser.consultantProfile as any).availability
              ? (activeUser.consultantProfile as any).availability.map((a: any) => ({
                  id: a.id,
                  date: a.date,
                  timeSlot: a.timeSlot,
                  isBooked: a.isBooked,
                }))
              : [],
          } : null,
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
        include: {
          profile: true,
          wallet: true,
          consultantProfile: {
            include: {
              reviews: { select: { rating: true } },
              availability: { orderBy: { date: "asc" } }
            }
          }
        },
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
          consultantProfile: user.consultantProfile ? {
            id: user.consultantProfile.id,
            status: user.consultantProfile.status,
            isApproved: user.consultantProfile.isApproved,
            specialty: user.consultantProfile.specialty,
            experience: user.consultantProfile.experience,
            bio: user.consultantProfile.bio,
            price: user.consultantProfile.price,
            rating: (user.consultantProfile as any).reviews && (user.consultantProfile as any).reviews.length > 0
              ? parseFloat(((user.consultantProfile as any).reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / (user.consultantProfile as any).reviews.length).toFixed(1))
              : 5.0,
            availability: (user.consultantProfile as any).availability
              ? (user.consultantProfile as any).availability.map((a: any) => ({
                  id: a.id,
                  date: a.date,
                  timeSlot: a.timeSlot,
                  isBooked: a.isBooked,
                }))
              : [],
          } : null,
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
        include: {
          profile: true,
          wallet: true,
          consultantProfile: {
            include: {
              reviews: { select: { rating: true } },
              availability: { orderBy: { date: "asc" } }
            }
          }
        },
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
          consultantProfile: updatedUser.consultantProfile ? {
            id: updatedUser.consultantProfile.id,
            status: updatedUser.consultantProfile.status,
            isApproved: updatedUser.consultantProfile.isApproved,
            specialty: updatedUser.consultantProfile.specialty,
            experience: updatedUser.consultantProfile.experience,
            bio: updatedUser.consultantProfile.bio,
            price: updatedUser.consultantProfile.price,
            rating: (updatedUser.consultantProfile as any).reviews && (updatedUser.consultantProfile as any).reviews.length > 0
              ? parseFloat(((updatedUser.consultantProfile as any).reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / (updatedUser.consultantProfile as any).reviews.length).toFixed(1))
              : 5.0,
            availability: (updatedUser.consultantProfile as any).availability
              ? (updatedUser.consultantProfile as any).availability.map((a: any) => ({
                  id: a.id,
                  date: a.date,
                  timeSlot: a.timeSlot,
                  isBooked: a.isBooked,
                }))
              : [],
          } : null,
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

      const hasConsultantProfile = await prisma.consultant.findUnique({
        where: { userId }
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          deletedAt: new Date(),
          role: "USER",
          isRoleLocked: false,
          ...(hasConsultantProfile ? {
            consultantProfile: {
              delete: true
            }
          } : {})
        },
      });

      logger.info(`User soft-deleted account: ${userId} (role unlocked & reset to USER, consultant profile deleted)`);
      return res.json({ message: "Account deleted successfully in database" });
    } catch (error) {
      next(error);
    }
  }
}
