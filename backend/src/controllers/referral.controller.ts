import { Response, NextFunction } from "express";
import { ReferralService } from "../services/referral.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class ReferralController {
  /**
   * Get invite code, list of referees and earnings info
   */
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await ReferralService.getReferralStats(userId);
      return res.json({
        referralCode: req.user!.referralCode,
        ...stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
