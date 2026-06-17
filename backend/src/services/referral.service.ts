import { prisma } from "../config/db";
import { WalletService } from "./wallet.service";
import { NotificationService } from "./notification.service";
import { TransactionCategory } from "@prisma/client";
import crypto from "crypto";
import { logger } from "../utils/logger";

export class ReferralService {
  /**
   * Generate a unique referral code for a user
   */
  static generateCode(): string {
    return `MDG-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  }

  /**
   * Track referral code registration and award wallet credits
   */
  static async processReferral(refereeId: string, referralCode: string): Promise<void> {
    try {
      if (!referralCode) return;

      const referrer = await prisma.user.findFirst({
        where: { referralCode: referralCode.toUpperCase(), isActive: true },
      });

      if (!referrer) {
        logger.warn(`Invalid or inactive referral code used: ${referralCode}`);
        return;
      }

      if (referrer.id === refereeId) {
        logger.warn(`User ${refereeId} tried to refer themselves.`);
        return;
      }

      // Create Referral entry
      const referral = await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          refereeId,
          code: referralCode.toUpperCase(),
          status: "COMPLETED",
          rewardGranted: true,
        },
      });

      // Award referral bonus (₹150 to referrer and referee)
      await WalletService.credit(
        referrer.id,
        150.0,
        TransactionCategory.REWARD,
        referral.id,
        `Referral Reward: Invited user with ID ${refereeId.substring(0, 8)}`
      );

      try {
        await NotificationService.sendNotification(
          referrer.id,
          "Referral Bonus Credited",
          "You received ₹150 for referring a new user!",
          "referral"
        );
      } catch (nErr: any) {
        logger.error(`Notification trigger failed for referrer: ${nErr.message}`);
      }

      await WalletService.credit(
        refereeId,
        150.0,
        TransactionCategory.REWARD,
        referral.id,
        `Referral Reward: Signed up using code ${referralCode}`
      );

      try {
        await NotificationService.sendNotification(
          refereeId,
          "Welcome Bonus Credited",
          "You received ₹150 for signing up with a referral code!",
          "referral"
        );
      } catch (nErr: any) {
        logger.error(`Notification trigger failed for referee: ${nErr.message}`);
      }

      logger.info(`Referral rewards processed between ${referrer.id} and ${refereeId}`);
    } catch (error: any) {
      logger.error(`Error processing referral: ${error.message}`);
    }
  }

  /**
   * Get referral stats for user
   */
  static async getReferralStats(userId: string) {
    const invites = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referee: {
          select: {
            id: true,
            createdAt: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    const totalEarned = invites.length * 150.0;

    return {
      invites: invites.map((invite) => ({
        id: invite.id,
        name: invite.referee.profile?.fullName || "A user",
        date: invite.createdAt,
        status: invite.status,
      })),
      totalEarned,
      referralsCount: invites.length,
    };
  }
}
