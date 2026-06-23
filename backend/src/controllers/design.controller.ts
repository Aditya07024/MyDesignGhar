import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { AIService } from "../services/ai.service";
import { StorageService } from "../services/storage.service";
import { buildSDXLPrompt } from "../utils/buildSDXLPrompt";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { logger } from "../utils/logger";
import { NotificationService } from "../services/notification.service";
import crypto from "crypto";

export class DesignController {
  /**
   * Generate 3 AI designs based on upload
   */
  static async generate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { style, roomType, budget, customKeywords } = req.body;
      const userId = req.user?.id || null;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "Original room image is required" });
      }

      // 1. Validate image format
      const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMimes.includes(file.mimetype)) {
        return res.status(400).json({ message: "Unsupported image format. Use JPEG, PNG, or WebP." });
      }

      logger.info(`Starting generation pipeline for User ${userId || "Guest"}. Style: ${style}, Room: ${roomType}`);

      const roomTypeMap: Record<string, string> = {
        living: "Living Room",
        bedroom: "Bedroom",
        kitchen: "Kitchen",
        bathroom: "Bathroom",
        dining: "Dining Room",
        office: "Office",
        kids: "Kids Room",
        balcony: "Balcony",
      };

      const finalRoomType = roomTypeMap[roomType.toLowerCase()] || roomType || "Bedroom";

      // 2. Detect room type (kept for reference / logging)
      const detectedRoom = await AIService.detectRoomType(file.buffer);
      logger.info(`Auto-detected room type: ${detectedRoom} (using user selection: ${finalRoomType})`);

      // 3. Generate depth map
      const depthMapBuffer = await AIService.generateDepthMap(file.buffer);

      // 4. Build prompt
      const { positivePrompt, negativePrompt } = buildSDXLPrompt({
        style,
        roomType: finalRoomType,
        budget,
        customKeywords,
      });

      // 5. Determine image reuse threshold based on total generations
      const totalGenerations = await prisma.designImage.count();
      let reuseCount = 0;
      if (totalGenerations >= 2000) {
        reuseCount = 2;
      } else if (totalGenerations >= 1000) {
        reuseCount = 1;
      }

      logger.info(`Total system generations: ${totalGenerations}. Planned reuse count: ${reuseCount}`);

      // Query past matching designs from database
      let reusableImages: any[] = [];
      if (reuseCount > 0) {
        reusableImages = await prisma.designImage.findMany({
          where: {
            design: {
              style,
              roomType: finalRoomType,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50, // Get the 50 most recent matching images to pick from
        });
        logger.info(`Found ${reusableImages.length} matching designs for style: ${style}, room: ${finalRoomType}`);
      }

      const actualReusedCount = Math.min(reuseCount, reusableImages.length);
      const newImagesCount = 3 - actualReusedCount;

      // Select unique random matching images from the pool
      const selectedReusedImages: any[] = [];
      if (actualReusedCount > 0 && reusableImages.length > 0) {
        const tempPool = [...reusableImages];
        for (let i = 0; i < actualReusedCount; i++) {
          const randIdx = Math.floor(Math.random() * tempPool.length);
          selectedReusedImages.push(tempPool.splice(randIdx, 1)[0]);
        }
        logger.info(`Reusing ${actualReusedCount} previous design images`);
      }

      // Generate remaining new designs in parallel using fallbacks
      const promises = Array.from({ length: newImagesCount }).map(async (_, i) => {
        const seed = Math.floor(Math.random() * 1000000);
        return AIService.generateImageFromProviders(
          positivePrompt,
          negativePrompt,
          seed,
          file.buffer
        );
      });
      const designBuffers = await Promise.all(promises);

      // 6. Create parent design record
      const design = await prisma.design.create({
        data: {
          userId,
          roomType: finalRoomType,
          style,
          budget,
          prompt: positivePrompt,
        },
      });

      // Upload depth map
      const depthMapPath = `depthmaps/${design.id}.jpg`;
      const depthMapUrl = await StorageService.uploadBuffer(
        depthMapBuffer,
        "previews",
        depthMapPath,
        "image/jpeg"
      );

      // Upload original user-uploaded room image as "before" photo
      const beforeRoomPath = `${design.id}/before.jpg`;
      await StorageService.uploadBuffer(
        file.buffer,
        "previews",
        beforeRoomPath,
        file.mimetype
      );

      const uploadedImages = [];

      // 7. Watermark, thumbnail, and upload each NEW design
      for (let i = 0; i < designBuffers.length; i++) {
        const buffer = designBuffers[i];
        const imageId = crypto.randomUUID();

        // Original image -> private bucket
        const originalPath = `originals/${design.id}/${imageId}.jpg`;
        const originalUrl = await StorageService.uploadBuffer(
          buffer,
          "originals",
          originalPath,
          "image/jpeg"
        );

        // Watermark -> public bucket
        const watermarked = await AIService.applyWatermark(buffer);
        const previewPath = `${design.id}/${imageId}.jpg`;
        const previewUrl = await StorageService.uploadBuffer(
          watermarked,
          "previews",
          previewPath,
          "image/jpeg"
        );

        // Thumbnail -> public bucket
        const thumbnail = await AIService.generateThumbnail(buffer);
        const thumbnailPath = `thumbnails/${design.id}/${imageId}.jpg`;
        const thumbnailUrl = await StorageService.uploadBuffer(
          thumbnail,
          "previews",
          thumbnailPath,
          "image/jpeg"
        );

        // Save image record
        const imageRecord = await prisma.designImage.create({
          data: {
            designId: design.id,
            originalUrl: originalPath,
            previewUrl,
            thumbnailUrl,
            depthMapUrl,
            provider: "Fallback Pipeline",
          },
        });

        uploadedImages.push(imageRecord);
      }

      // 8. Create image records for REUSED designs pointing to their existing URLs
      for (let i = 0; i < selectedReusedImages.length; i++) {
        const reused = selectedReusedImages[i];
        const imageRecord = await prisma.designImage.create({
          data: {
            designId: design.id,
            originalUrl: reused.originalUrl,
            previewUrl: reused.previewUrl,
            thumbnailUrl: reused.thumbnailUrl,
            depthMapUrl: reused.depthMapUrl || depthMapUrl,
            provider: `Reused Pipeline (ID: ${reused.id})`,
          },
        });
        uploadedImages.push(imageRecord);
      }

      logger.info(`Generation pipeline completed for Design ${design.id}`);

      if (userId) {
        try {
          await NotificationService.sendNotification(
            userId,
            "Your design is ready!",
            `3 new ${style} ${finalRoomType} designs are waiting.`,
            "design"
          );
        } catch (nErr: any) {
          logger.error(`Notification trigger failed during design generation: ${nErr.message}`);
        }
      }

      return res.status(201).json({
        message: "Designs generated successfully",
        design: {
          ...design,
          depthMapUrl,
          beforeUrl: `${env.BACKEND_URL}/uploads/previews/${design.id}/before.jpg`,
          images: uploadedImages.map((img) => ({
            id: img.id,
            previewUrl: img.previewUrl,
            thumbnailUrl: img.thumbnailUrl,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's designs
   */
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        // Return recent public designs for guest
        const publicDesigns = await prisma.design.findMany({
          where: { deletedAt: null },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { images: true },
        });
        return res.json({ designs: publicDesigns });
      }

      const userDesigns = await prisma.design.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { images: true, purchases: true },
      });

      return res.json({
        designs: userDesigns.map((d: any) => ({
          id: d.id,
          roomType: d.roomType,
          style: d.style,
          budget: d.budget,
          createdAt: d.createdAt,
          images: d.images.map((img: any) => ({
            id: img.id,
            previewUrl: img.previewUrl,
            thumbnailUrl: img.thumbnailUrl,
          })),
          purchased: true, // User owns these designs, so they are unlocked
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get design details
   */
  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const design = await prisma.design.findUnique({
        where: { id },
        include: { images: true, purchases: { where: { userId } } },
      });

      if (!design || design.deletedAt) {
        return res.status(404).json({ message: "Design not found" });
      }

      const isOwner = design.userId === userId;
      const isPurchased = design.purchases.length > 0;
      const hasPurchasedWhole = design.purchases.some((p: any) => p.designImageId === null);

      return res.json({
        design: {
          id: design.id,
          roomType: design.roomType,
          style: design.style,
          budget: design.budget,
          createdAt: design.createdAt,
          isOwner,
          purchased: isPurchased,
          beforeUrl: `${env.BACKEND_URL}/uploads/previews/${design.id}/before.jpg`,
          images: design.images.map((img: any) => ({
            id: img.id,
            previewUrl: img.previewUrl,
            thumbnailUrl: img.thumbnailUrl,
            depthMapUrl: img.depthMapUrl,
            purchased: hasPurchasedWhole || design.purchases.some((p: any) => p.designImageId === img.id),
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get secure original download URL (Requires Purchase verification)
   */
  static async getDownloadUrl(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // design image id
      const userId = req.user!.id;

      const designImage = await prisma.designImage.findUnique({
        where: { id },
        include: { design: true },
      });

      if (!designImage) {
        return res.status(404).json({ message: "Design image not found" });
      }

      // Validate user has purchased the specific image, the full design, is the owner, or is an Admin/SuperAdmin
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId,
          status: "COMPLETED",
          OR: [
            { designImageId: id },
            { designId: designImage.designId, designImageId: null }
          ]
        },
      });

      const isAdmin = req.user!.role === "ADMIN" || req.user!.role === "SUPER_ADMIN";

      if (!purchase && !isAdmin) {
        return res.status(403).json({ message: "Purchase required to download high-resolution original" });
      }

      // Generate signed URL from private Supabase bucket
      const signedUrl = await StorageService.getSignedUrl(
        "originals",
        designImage.originalUrl,
        3600 // expires in 1 hour
      );

      return res.json({ downloadUrl: signedUrl });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle favorite design
   */
  static async toggleFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // design id
      const userId = req.user!.id;

      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_designId: {
            userId,
            designId: id,
          },
        },
      });

      if (favorite) {
        await prisma.favorite.delete({
          where: {
            userId_designId: {
              userId,
              designId: id,
            },
          },
        });
        return res.json({ favorited: false, message: "Removed from favorites" });
      } else {
        await prisma.favorite.create({
          data: {
            userId,
            designId: id,
          },
        });
        return res.json({ favorited: true, message: "Added to favorites" });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit to daily challenges
   */
  static async submitChallenge(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // design id
      const userId = req.user!.id;
      const today = new Date().toISOString().split("T")[0];

      // Validate design belongs to user
      const design = await prisma.design.findUnique({ where: { id } });
      if (!design || design.userId !== userId) {
        return res.status(403).json({ message: "You can only submit your own designs" });
      }

      // Check if already submitted today
      const existing = await prisma.challengeEntry.findUnique({
        where: {
          userId_challengeDate: {
            userId,
            challengeDate: today,
          },
        },
      });

      if (existing) {
        return res.status(400).json({ message: "You can only submit one design per daily challenge" });
      }

      const entry = await prisma.challengeEntry.create({
        data: {
          userId,
          designId: id,
          challengeDate: today,
        },
      });

      return res.status(201).json({
        message: "Successfully entered into today's challenge!",
        entry,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Liking challenge entry
   */
  static async likeChallengeEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // entry id
      const entry = await prisma.challengeEntry.update({
        where: { id },
        data: {
          likes: { increment: 1 },
        },
      });

      return res.json({ likes: entry.likes });
    } catch (error) {
      next(error);
    }
  }
}
