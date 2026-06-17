import { Response, NextFunction } from "express";
import { WalletService } from "../services/wallet.service";
import { PaymentService } from "../services/payment.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import { TransactionType, TransactionCategory } from "@prisma/client";
import crypto from "crypto";

export class WalletController {
  /**
   * Get balance and wallet info
   */
  static async getBalance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const wallet = await WalletService.getBalance(userId);
      return res.json({ wallet });
    } catch (error) {
      next(error);
    }
  }

  static async requestTopUp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { amount, mock } = req.body;
      const userId = req.user!.id;

      if (mock || !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes("yourKeyId")) {
        const result = await WalletService.credit(
          userId,
          amount,
          TransactionCategory.TOP_UP,
          undefined,
          `Wallet Top-Up (Mock Recharge)`
        );
        return res.json({
          message: "Mock wallet recharge successful",
          wallet: result.wallet,
        });
      }

      const randomRef = crypto.randomUUID();
      const receiptId = `wallet_topup_${userId.substring(0, 8)}_${randomRef.substring(0, 8)}`;

      // Prepare Razorpay Order with userId in notes
      const order = await PaymentService.createOrder(amount, receiptId, { userId });

      return res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: receiptId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch wallet transactions history
   */
  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const history = await WalletService.getHistory(userId);
      return res.json({ transactions: history });
    } catch (error) {
      next(error);
    }
  }

  static async purchaseImages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { designImageIds } = req.body;
      const userId = req.user!.id;

      if (!designImageIds || !Array.isArray(designImageIds) || designImageIds.length === 0) {
        return res.status(400).json({ message: "No design images specified for purchase" });
      }

      // 1. Fetch images to verify they exist
      const designImages = await prisma.designImage.findMany({
        where: {
          id: { in: designImageIds },
        },
      });

      if (designImages.length !== designImageIds.length) {
        return res.status(404).json({ message: "Some design images could not be found" });
      }

      const designId = designImages[0].designId;
      if (designImages.some((img: any) => img.designId !== designId)) {
        return res.status(400).json({ message: "All design images must belong to the same design" });
      }

      // 2. Fetch existing completed purchases for these images
      const existingPurchases = await prisma.purchase.findMany({
        where: {
          userId,
          designImageId: { in: designImageIds },
          status: "COMPLETED",
        },
      });

      const purchasedImageIds = new Set(existingPurchases.map((p: any) => p.designImageId));
      const unpurchasedImages = designImages.filter((img: any) => !purchasedImageIds.has(img.id));

      if (unpurchasedImages.length === 0) {
        return res.json({
          message: "All selected images are already purchased",
          purchases: existingPurchases.map((p: any) => ({
            id: p.id,
            designImageId: p.designImageId,
            amount: p.amount,
            status: p.status,
          })),
        });
      }

      // Cost is ₹299 per unpurchased image
      const costPerImage = 299.0;
      const totalCost = unpurchasedImages.length * costPerImage;

      // 3. Verify wallet balance, debit, and create purchases in a single database transaction
      const result = await prisma.$transaction(async (tx: any) => {
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet || wallet.balance < totalCost) {
          throw new Error("Insufficient wallet balance");
        }

        // Debit wallet balance
        const updatedWallet = await tx.wallet.update({
          where: { userId },
          data: { balance: { decrement: totalCost } },
        });

        // Log transaction
        await tx.walletTransaction.create({
          data: {
            walletId: updatedWallet.id,
            amount: totalCost,
            type: TransactionType.DEBIT,
            category: TransactionCategory.PAY_DESIGN,
            referenceId: designId,
            description: `Combined Purchase of ${unpurchasedImages.length} Design Images`,
          },
        });

        // Create completed Purchase records
        const purchases = await Promise.all(
          unpurchasedImages.map((img: any) =>
            tx.purchase.create({
              data: {
                userId,
                designId,
                designImageId: img.id,
                amount: costPerImage,
                status: "COMPLETED",
              },
            })
          )
        );

        return { wallet: updatedWallet, purchases };
      });

      return res.json({
        message: "Images purchased successfully using wallet balance",
        walletBalance: result.wallet.balance,
        purchases: result.purchases.map((p: any) => ({
          id: p.id,
          designImageId: p.designImageId,
          amount: p.amount,
          status: p.status,
        })),
      });
    } catch (error: any) {
      if (error.message === "Insufficient wallet balance") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}
