import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Clerk Synchronization and Session Verification
router.post("/sync", authenticate as any, AuthController.sync as any);
router.get("/me", authenticate as any, AuthController.getMe as any);

// User Profile management
router.put("/profile", authenticate as any, AuthController.updateProfile as any);
router.delete("/delete", authenticate as any, AuthController.deleteAccount as any);

export default router;
