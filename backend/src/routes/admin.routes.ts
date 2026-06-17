import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { postAffiliateProductSchema } from "../validators/schemas";
import { Role } from "@prisma/client";

const router = Router();

// Restrict all routes to ADMIN or SUPER_ADMIN
const adminRoles = [Role.ADMIN, Role.SUPER_ADMIN];

router.get("/users", authenticate as any, authorize(adminRoles) as any, AdminController.listUsers as any);
router.post("/users/:id/ban", authenticate as any, authorize(adminRoles) as any, AdminController.banUser as any);
router.post("/consultants/:id/status", authenticate as any, authorize(adminRoles) as any, AdminController.updateConsultantStatus as any);
router.post("/purchases/:id/refund", authenticate as any, authorize(adminRoles) as any, AdminController.refundPurchase as any);
router.post("/products", validate(postAffiliateProductSchema), authenticate as any, authorize(adminRoles) as any, AdminController.createAffiliateProduct as any);
router.get("/audit-logs", authenticate as any, authorize(adminRoles) as any, AdminController.getAuditLogs as any);

export default router;
