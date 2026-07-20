import { Response, NextFunction } from "express";
import { ReferralService } from "../services/referral.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import { WalletService } from "../services/wallet.service";
import { TransactionCategory } from "@prisma/client";
import { NotificationService } from "../services/notification.service";

export class ReferralController {
  /**
   * Get invite code, list of referees and earnings info
   */
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await ReferralService.getReferralStats(userId);
      return res.json({
        referralCode: req.user!.referralCode,
        ...stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify if a referral coupon code is valid
   */
  static async verifyCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const userId = req.user!.id;

      if (!code) {
        return res.status(400).json({ message: "Coupon code is required" });
      }

      const referrer = await prisma.user.findFirst({
        where: { referralCode: code.toUpperCase(), isActive: true },
        include: { profile: true }
      });

      if (!referrer) {
        return res.status(404).json({ valid: false, message: "Invalid coupon or referral code" });
      }

      if (referrer.id === userId) {
        return res.status(400).json({ valid: false, message: "You cannot use your own referral code" });
      }

      return res.json({
        valid: true,
        referrerName: referrer.profile?.fullName || "A Designer Mitra User",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unlock design for free using a referral coupon code
   */
  static async useCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { designId, referralCode } = req.body;
      const userId = req.user!.id;

      if (!designId || !referralCode) {
        return res.status(400).json({ message: "Design ID and Referral Code are required" });
      }

      const referrer = await prisma.user.findFirst({
        where: { referralCode: referralCode.toUpperCase(), isActive: true }
      });

      if (!referrer) {
        return res.status(400).json({ message: "Invalid referral code" });
      }

      if (referrer.id === userId) {
        return res.status(400).json({ message: "You cannot use your own referral code" });
      }

      const designImage = await prisma.designImage.findUnique({
        where: { id: designId }
      });

      if (!designImage) {
        return res.status(404).json({ message: "Design image not found" });
      }

      // Check if user already purchased this design
      const existingPurchase = await prisma.purchase.findFirst({
        where: { userId, designImageId: designId }
      });

      if (existingPurchase && existingPurchase.status === "COMPLETED") {
        return res.status(400).json({ message: "You have already unlocked this design" });
      }

      // Check if user has already used a referral coupon (1 per user limit, represented by amount = 0)
      const usedCoupon = await prisma.purchase.findFirst({
        where: { userId, amount: 0 }
      });

      if (usedCoupon) {
        return res.status(400).json({ message: "You have already used a referral coupon code" });
      }

      // Create purchase for referee (₹0 cost)
      const purchase = await prisma.purchase.create({
        data: {
          userId,
          designId: designImage.designId,
          designImageId: designImage.id,
          amount: 0,
          status: "COMPLETED"
        }
      });

      // Award referrer ₹299 (the cost of one design purchase)
      await WalletService.credit(
        referrer.id,
        299.0,
        TransactionCategory.REWARD,
        undefined,
        `Referral Reward: Design unlocked by referred user ${userId.substring(0, 8)}`
      );

      try {
        await NotificationService.sendNotification(
          referrer.id,
          "Referral Reward Claimed!",
          "A user unlocked a design using your code. You have been rewarded with ₹299 wallet balance!",
          "referral"
        );
      } catch (nErr) {
        // Ignored
      }

      // Record referral connection if none exists
      const existingReferral = await prisma.referral.findUnique({
        where: { refereeId: userId }
      });

      if (!existingReferral) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            refereeId: userId,
            code: referralCode.toUpperCase(),
            status: "COMPLETED",
            rewardGranted: true
          }
        });
      }

      return res.json({
        message: "Design unlocked successfully using referral coupon!",
        purchase: {
          id: purchase.id,
          designImageId: purchase.designImageId,
          amount: purchase.amount,
          status: purchase.status
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
