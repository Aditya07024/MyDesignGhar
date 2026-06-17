import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/stats",
  authenticate as any,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]) as any,
  AnalyticsController.getPlatformStats
);

export default router;
