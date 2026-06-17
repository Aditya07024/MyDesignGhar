import { Router } from "express";
import { DesignController } from "../controllers/design.controller";
import { authenticate } from "../middlewares/auth.middleware";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Generate designs (processes file upload and creates record)
router.post("/generate", upload.single("image"), authenticate as any, DesignController.generate as any);

// User's designs history
router.get("/", authenticate as any, DesignController.list as any);

// Design details
router.get("/:id", authenticate as any, DesignController.getById as any);

// High-resolution image download signed URL
router.get("/image/:id/download", authenticate as any, DesignController.getDownloadUrl as any);

// Toggle favorite design
router.post("/:id/favorite", authenticate as any, DesignController.toggleFavorite as any);

// Submit to daily challenges
router.post("/:id/challenge", authenticate as any, DesignController.submitChallenge as any);

// Liked challenge entry
router.post("/challenge/entry/:id/like", authenticate as any, DesignController.likeChallengeEntry as any);

export default router;
