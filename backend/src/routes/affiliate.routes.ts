import { Router } from "express";
import { AffiliateController } from "../controllers/affiliate.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/products", AffiliateController.listProducts);
router.post("/click", authenticate as any, AffiliateController.trackClick as any);

export default router;
