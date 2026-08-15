import { Router } from "express";
import authRoutes from "./auth.routes";
import designRoutes from "./design.routes";
import paymentRoutes from "./payment.routes";
import walletRoutes from "./wallet.routes";
import referralRoutes from "./referral.routes";
import consultantRoutes from "./consultant.routes";
import affiliateRoutes from "./affiliate.routes";
import adminRoutes from "./admin.routes";
import analyticsRoutes from "./analytics.routes";
import storageRoutes from "./storage.routes";
import notificationRoutes from "./notification.routes";
import quoteRoutes from "./quote.routes";
import ideasRoutes from "./ideas.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/designs", designRoutes);
router.use("/payments", paymentRoutes);
router.use("/wallets", walletRoutes);
router.use("/referrals", referralRoutes);
router.use("/consultants", consultantRoutes);
router.use("/affiliates", affiliateRoutes);
router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/storage", storageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/quote", quoteRoutes);
router.use("/quotes", quoteRoutes);
router.use("/ideas", ideasRoutes);

export default router;
