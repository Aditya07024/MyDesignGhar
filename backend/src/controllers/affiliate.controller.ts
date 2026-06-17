import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class AffiliateController {
  /**
   * List affiliate products (categorized by furniture/decor)
   */
  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.query;

      const products = await prisma.affiliateProduct.findMany({
        where: {
          deletedAt: null,
          ...(category && { category: category as string }),
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ products });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Track redirection clicks
   */
  static async trackClick(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { productId } = req.body;
      const userId = req.user?.id || null;

      const product = await prisma.affiliateProduct.findUnique({
        where: { id: productId },
      });

      if (!product || product.deletedAt) {
        return res.status(404).json({ message: "Product not found" });
      }

      const click = await prisma.affiliateClick.create({
        data: {
          productId,
          userId,
        },
      });

      return res.status(201).json({
        message: "Redirection click tracked successfully",
        redirectUrl: product.link,
        clickId: click.id,
      });
    } catch (error) {
      next(error);
    }
  }
}
