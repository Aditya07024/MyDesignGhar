import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { PaymentService } from "../services/payment.service";
import { WalletService } from "../services/wallet.service";
import { NotificationService } from "../services/notification.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { TransactionCategory, BookingStatus } from "@prisma/client";
import { logger } from "../utils/logger";

export class PaymentController {
  /**
   * Create Razorpay Order for a Direct Design Purchase (₹299)
   */
  static async createDesignPurchaseOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { designId } = req.body;
      const userId = req.user!.id;

      // Check if already purchased
      const existing = await prisma.purchase.findFirst({
        where: { designId, userId, status: "COMPLETED" },
      });

      if (existing) {
        return res.status(400).json({ message: "Design already purchased" });
      }

      const amount = 299.0;
      const receiptId = `purchase_design_${userId.substring(0, 8)}_${designId.substring(0, 8)}`;

      // Create local pending purchase record
      const purchase = await prisma.purchase.create({
        data: {
          userId,
          designId,
          amount,
          status: "PENDING",
        },
      });

      const order = await PaymentService.createOrder(amount, receiptId);

      // Save order id reference
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { razorpayOrderId: order.id },
      });

      return res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        purchaseId: purchase.id,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify direct payment signature manually
   */
  static async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, paymentId, signature, purchaseId, isWalletTopUp, amount } = req.body;
      const userId = req.user!.id;

      const isValid = PaymentService.verifyPaymentSignature(orderId, paymentId, signature);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }

      if (isWalletTopUp) {
        // Double check if this transaction reference already exists to prevent double credit
        const existingTx = await prisma.walletTransaction.findFirst({
          where: { referenceId: orderId },
        });

        if (!existingTx) {
          await WalletService.credit(
            userId,
            amount,
            TransactionCategory.TOP_UP,
            orderId,
            `Wallet Top-Up via Razorpay (Ref: ${paymentId})`
          );
          try {
            await NotificationService.sendNotification(
              userId,
              "Wallet Credited",
              `₹${amount} has been successfully added to your wallet.`,
              "payment"
            );
          } catch (nErr: any) {
            logger.error(`Notification trigger failed during manual wallet top-up: ${nErr.message}`);
          }
        }

        return res.json({ message: "Wallet topped up successfully" });
      }

      await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          status: "COMPLETED",
          razorpayPaymentId: paymentId,
        },
      });

      logger.info(`Payment verified for purchase ${purchaseId}`);

      return res.json({ message: "Payment verified successfully and purchase unlocked" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Razorpay Webhook Handler for asynchronous events
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      const payloadString = JSON.stringify(req.body);

      const isValid = PaymentService.verifyWebhookSignature(payloadString, signature);
      if (!isValid) {
        logger.error("Invalid webhook signature received");
        return res.status(400).json({ message: "Invalid signature" });
      }

      const event = req.body.event;
      logger.info(`Razorpay Webhook Event: ${event}`);

      if (event === "order.paid" || event === "payment.captured") {
        const orderDetails = req.body.payload.payment.entity;
        const razorpayOrderId = orderDetails.order_id;
        const razorpayPaymentId = orderDetails.id;
        const receipt = orderDetails.notes?.receipt || req.body.payload.order?.entity?.receipt;

        if (receipt) {
          logger.info(`Processing payment receipt: ${receipt}`);

          // 1. Direct design purchase webhook handler
          if (receipt.startsWith("purchase_design_")) {
            const purchase = await prisma.purchase.findFirst({
              where: { razorpayOrderId },
            });
            if (purchase && purchase.status !== "COMPLETED") {
              await prisma.purchase.update({
                where: { id: purchase.id },
                data: { status: "COMPLETED", razorpayPaymentId },
              });
              await NotificationService.sendNotification(
                purchase.userId,
                "Purchase Completed",
                "You have successfully purchased the high-resolution design download.",
                "payment"
              );
            }
          }

          // 2. Wallet top-up webhook handler
          else if (receipt.startsWith("wallet_topup_")) {
            const parts = receipt.split("_");
            const userId = orderDetails.notes?.userId || parts[2]; // Use full userId from notes first, fallback to parts[2]
            const amount = parseFloat(orderDetails.amount) / 100.0; // paise to rupees

            // Update transactions in database
            const walletTx = await prisma.walletTransaction.findFirst({
              where: { referenceId: razorpayOrderId },
            });

            if (!walletTx) {
              await WalletService.credit(
                userId,
                amount,
                TransactionCategory.TOP_UP,
                razorpayOrderId,
                `Wallet Top-Up via Razorpay (Ref: ${razorpayPaymentId})`
              );
              await NotificationService.sendNotification(
                userId,
                "Wallet Credited",
                `₹${amount} has been successfully added to your wallet.`,
                "payment"
              );
            }
          }

          // 3. Consultant Booking payment
          else if (receipt.startsWith("booking_")) {
            const booking = await prisma.consultationBooking.findFirst({
              where: { razorpayOrderId },
              include: {
                availability: {
                  include: {
                    consultant: true,
                  },
                },
              },
            });
            if (booking && booking.status === "PENDING") {
              await prisma.consultationBooking.update({
                where: { id: booking.id },
                data: { status: BookingStatus.CONFIRMED, razorpayPaymentId },
              });

              // Mark availability slot as booked
              await prisma.consultantAvailability.update({
                where: { id: booking.availabilityId },
                data: { isBooked: true },
              });

              await NotificationService.sendNotification(
                booking.userId,
                "Consultation Confirmed",
                "Your video session booking has been successfully confirmed.",
                "reminder"
              );

              // Notify the consultant
              if (booking.availability?.consultant?.userId) {
                try {
                  await NotificationService.sendNotification(
                    booking.availability.consultant.userId,
                    "New Session Booked",
                    `You have a new video consultation booked at ${booking.availability.timeSlot} on ${new Date(booking.availability.date).toDateString()}`,
                    "reminder"
                  );
                } catch (nErr: any) {
                  logger.error(`Notification trigger failed for consultant: ${nErr.message}`);
                }
              }
            }
          }
        }
      }

      return res.json({ status: "ok" });
    } catch (error) {
      next(error);
    }
  }
}
