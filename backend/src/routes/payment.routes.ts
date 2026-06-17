import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Order creation and signature validation (Client facing)
router.post("/create-order", authenticate as any, PaymentController.createDesignPurchaseOrder as any);
router.post("/verify", authenticate as any, PaymentController.verifyPayment as any);

// Webhook listener (Razorpay server facing)
router.post("/webhook", PaymentController.handleWebhook);

export default router;
