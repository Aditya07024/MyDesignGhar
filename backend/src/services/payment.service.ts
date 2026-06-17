import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../utils/logger";

let razorpay: Razorpay;
try {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
} catch (error: any) {
  logger.error(`Failed to initialize Razorpay: ${error.message}`);
}

export class PaymentService {
  /**
   * Create Razorpay Order
   */
  static async createOrder(amount: number, receiptId: string, notes?: Record<string, string>): Promise<any> {
    try {
      logger.info(`Creating Razorpay order for ₹${amount}...`);
      if (!razorpay) {
        // Mock fallback for test environment
        return {
          id: `order_mock_${crypto.randomBytes(8).toString("hex")}`,
          amount: amount * 100,
          currency: "INR",
          receipt: receiptId,
          status: "created",
        };
      }

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // convert to paise
        currency: "INR",
        receipt: receiptId,
        notes,
      });

      return order;
    } catch (error: any) {
      logger.error(`Razorpay order creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify Razorpay Payment Signature
   */
  static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      const generatedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      return generatedSignature === signature;
    } catch (error: any) {
      logger.error(`Signature verification error: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify Webhook Signature
   */
  static verifyWebhookSignature(payloadString: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
        .update(payloadString)
        .digest("hex");

      return expectedSignature === signature;
    } catch (error: any) {
      logger.error(`Webhook signature verification error: ${error.message}`);
      return false;
    }
  }

  /**
   * Refund a payment
   */
  static async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      logger.info(`Refunding payment ${paymentId}...`);
      if (!razorpay) {
        return { id: `rfnd_mock_${crypto.randomBytes(8).toString("hex")}`, status: "processed" };
      }

      const refundOptions: any = { payment_id: paymentId };
      if (amount) {
        refundOptions.amount = Math.round(amount * 100);
      }

      return await razorpay.payments.refund(paymentId, refundOptions);
    } catch (error: any) {
      logger.error(`Refund failed: ${error.message}`);
      throw error;
    }
  }
}
