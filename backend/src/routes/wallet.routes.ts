import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller";
import { validate } from "../middlewares/validation.middleware";
import { topUpWalletSchema } from "../validators/schemas";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/balance", authenticate as any, WalletController.getBalance as any);
router.post("/topup", validate(topUpWalletSchema), authenticate as any, WalletController.requestTopUp as any);
router.get("/history", authenticate as any, WalletController.getHistory as any);
router.post("/purchase-images", authenticate as any, WalletController.purchaseImages as any);

export default router;
