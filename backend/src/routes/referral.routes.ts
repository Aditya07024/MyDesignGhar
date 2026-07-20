import { Router } from "express";
import { ReferralController } from "../controllers/referral.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/stats", authenticate as any, ReferralController.getStats as any);
router.post("/verify-coupon", authenticate as any, ReferralController.verifyCoupon as any);
router.post("/use-coupon", authenticate as any, ReferralController.useCoupon as any);

export default router;
