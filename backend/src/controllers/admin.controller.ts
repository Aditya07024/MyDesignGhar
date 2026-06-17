import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { PaymentService } from "../services/payment.service";
import { WalletService } from "../services/wallet.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Role, ConsultantStatus, TransactionCategory } from "@prisma/client";
import { logger } from "../utils/logger";

export class AdminController {
  /**
   * View all users
   */
  static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        include: {
          profile: true,
          consultantProfile: {
            include: {
              portfolios: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ users });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ban user
   */
  static async banUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      // Write to audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: "BAN_USER",
          details: `Banned user ID ${id}`,
        },
      });

      logger.info(`Admin banned user ${id}`);
      return res.json({ message: "User has been banned successfully", user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve/Suspend consultant
   */
  static async updateConsultantStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body; // APPROVED, REJECTED, SUSPENDED

      const consultant = await prisma.consultant.update({
        where: { id },
        data: {
          status,
          isApproved: status === ConsultantStatus.APPROVED,
        },
      });

      // If approved, verify user is marked as CONSULTANT role
      if (status === ConsultantStatus.APPROVED) {
        await prisma.user.update({
          where: { id: consultant.userId },
          data: { role: Role.CONSULTANT },
        });
      } else if (status === ConsultantStatus.SUSPENDED || status === ConsultantStatus.REJECTED) {
        // Demote back to USER
        await prisma.user.update({
          where: { id: consultant.userId },
          data: { role: Role.USER },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: "UPDATE_CONSULTANT_STATUS",
          details: `Updated consultant ${id} status to ${status}`,
        },
      });

      return res.json({ message: `Consultant status updated to ${status}`, consultant });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refund purchase
   */
  static async refundPurchase(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // purchase id

      const purchase = await prisma.purchase.findUnique({ where: { id } });
      if (!purchase || purchase.status !== "COMPLETED") {
        return res.status(400).json({ message: "Completed purchase record not found" });
      }

      // 1. Process payment refund using Razorpay
      if (purchase.razorpayPaymentId) {
        await PaymentService.refundPayment(purchase.razorpayPaymentId, purchase.amount);
      }

      // 2. Or refund to user wallet
      await WalletService.credit(
        purchase.userId,
        purchase.amount,
        TransactionCategory.REFUND,
        purchase.id,
        `Refund for design purchase ID ${purchase.designId}`
      );

      // Update purchase record
      const updated = await prisma.purchase.update({
        where: { id },
        data: { status: "REFUNDED" },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: "REFUND_PURCHASE",
          details: `Refunded purchase ${id} of value ₹${purchase.amount}`,
        },
      });

      return res.json({ message: "Purchase refunded successfully", purchase: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Affiliate Product
   */
  static async createAffiliateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, description, price, imageUrl, link, category } = req.body;

      const product = await prisma.affiliateProduct.create({
        data: {
          title,
          description,
          price,
          imageUrl,
          link,
          category,
        },
      });

      return res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * View audit logs
   */
  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              profile: { select: { fullName: true } },
            },
          },
        },
      });
      return res.json({ auditLogs: logs });
    } catch (error) {
      next(error);
    }
  }
}
