import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate as any, NotificationController.list as any);
router.post("/read-all", authenticate as any, NotificationController.markAllAsRead as any);
router.post("/:id/read", authenticate as any, NotificationController.markAsRead as any);

export default router;
