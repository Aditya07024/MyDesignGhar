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

      // 2. Detect room type
      const detectedRoom = await AIService.detectRoomType(file.buffer);

      let finalRoomType;
      const rtLower = typeof roomType === "string" ? roomType.toLowerCase() : "";
      if (!rtLower || rtLower === "auto" || rtLower === "auto-detect" || rtLower === "other") {
        finalRoomType = detectedRoom;
      } else {
        finalRoomType = roomTypeMap[rtLower] || roomType || "Bedroom";
      }

      logger.info(`Auto-detected room type: ${detectedRoom} (final resolved room type: ${finalRoomType})`);

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

      // Generate remaining new designs sequentially using fallbacks
      const designBuffers: Buffer[] = [];
      for (let i = 0; i < newImagesCount; i++) {
        if (i > 0) {
          // Add a delay to prevent concurrent Hugging Face rate limits
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
        
        const seed = Math.floor(Math.random() * 1000000);
        
        // Vary prompts slightly for each variant to ensure different layout redesigns
        const variantPrompts = [
          positivePrompt,
          `${positivePrompt}, architectural digest style, warm lighting, extremely detailed`,
          `${positivePrompt}, dynamic perspective, natural afternoon sunlight, magazine photorealistic`
        ];
        const promptToUse = variantPrompts[i % variantPrompts.length];
        
        const buffer = await AIService.generateImageFromProviders(
          promptToUse,
          negativePrompt,
          seed,
          file.buffer
        );
        designBuffers.push(buffer);
      }

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
        include: {
          images: {
            include: {
              favorites: { where: { userId } }
            }
          },
          purchases: true,
          challenge: true
        },
      });

      return res.json({
        designs: userDesigns.map((d: any) => ({
          id: d.id,
          roomType: d.roomType,
          style: d.style,
          budget: d.budget,
          createdAt: d.createdAt,
          beforeUrl: `${env.BACKEND_URL}/uploads/previews/${d.id}/before.jpg`,
          images: d.images.map((img: any) => ({
            id: img.id,
            previewUrl: img.previewUrl,
            thumbnailUrl: img.thumbnailUrl,
            isFavorite: img.favorites?.length > 0,
          })),
          purchased: d.purchases.some((p: any) => p.status === "COMPLETED"),
          isPublished: d.challenge?.length > 0,
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

      let design = await prisma.design.findUnique({
        where: { id },
        include: {
          images: {
            include: {
              favorites: { where: { userId } }
            }
          },
          purchases: { where: { userId } },
          challenge: true
        },
      });

      if (!design) {
        // Try resolving by DesignImage ID
        const designImg = await prisma.designImage.findUnique({
          where: { id },
          include: {
            design: {
              include: {
                images: {
                  include: {
                    favorites: { where: { userId } }
                  }
                },
                purchases: { where: { userId } },
                challenge: true
              }
            }
          }
        });
        if (designImg) {
          design = designImg.design as any;
        }
      }

      if (!design || design.deletedAt) {
        return res.status(404).json({ message: "Design not found" });
      }

      const isOwner = design.userId === userId;
      const isPurchased = design.purchases.some((p: any) => p.status === "COMPLETED");
      const hasPurchasedWhole = design.purchases.some((p: any) => p.designImageId === null && p.status === "COMPLETED");

      return res.json({
        design: {
          id: design.id,
          roomType: design.roomType,
          style: design.style,
          budget: design.budget,
          createdAt: design.createdAt,
          isOwner,
          purchased: isPurchased,
          isPublished: (design as any).challenge?.length > 0,
          beforeUrl: `${env.BACKEND_URL}/uploads/previews/${design.id}/before.jpg`,
          images: design.images.map((img: any) => ({
            id: img.id,
            previewUrl: img.previewUrl,
            thumbnailUrl: img.thumbnailUrl,
            depthMapUrl: img.depthMapUrl,
            isFavorite: img.favorites?.length > 0,
            purchased: hasPurchasedWhole || design.purchases.some((p: any) => p.designImageId === img.id && p.status === "COMPLETED"),
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
      const { id } = req.params; // design id or design image id
      const userId = req.user!.id;

      let designId = id;
      let designImageId = "";
      
      const designImg = await prisma.designImage.findUnique({ where: { id } });
      if (designImg) {
        designId = designImg.designId;
        designImageId = designImg.id;
      } else {
        const design = await prisma.design.findUnique({ where: { id }, include: { images: true } });
        if (design && design.images.length > 0) {
          designImageId = design.images[0].id;
        }
      }

      if (!designImageId) {
        return res.status(400).json({ message: "Invalid design image ID" });
      }

      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_designId_designImageId: {
            userId,
            designId,
            designImageId,
          },
        },
      });

      if (favorite) {
        await prisma.favorite.delete({
          where: {
            userId_designId_designImageId: {
              userId,
              designId,
              designImageId,
            },
          },
        });
        return res.json({ favorited: false, message: "Removed from favorites" });
      } else {
        await prisma.favorite.create({
          data: {
            userId,
            designId,
            designImageId,
          },
        });
        return res.json({ favorited: true, message: "Added to favorites" });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete design (Soft delete)
   */
  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      let design = await prisma.design.findUnique({
        where: { id },
      });

      if (!design) {
        const designImg = await prisma.designImage.findUnique({
          where: { id },
          include: { design: true },
        });
        if (designImg) {
          design = designImg.design;
        }
      }

      if (!design || design.deletedAt) {
        return res.status(404).json({ message: "Design not found" });
      }

      if (design.userId !== userId && req.user!.role !== "ADMIN" && req.user!.role !== "SUPER_ADMIN") {
        if (design.userId === null) {
          // Claim the design for this user
          await prisma.design.update({
            where: { id: design.id },
            data: { userId },
          });
          logger.info(`Design ${design.id} claimed for deletion by User ${userId}`);
        } else {
          return res.status(403).json({ message: "You can only delete your own designs" });
        }
      }

      await prisma.design.update({
        where: { id: design.id },
        data: { deletedAt: new Date() },
      });

      return res.json({ success: true, message: "Design deleted successfully" });
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
      let design = await prisma.design.findUnique({ where: { id } });
      if (!design) {
        const designImg = await prisma.designImage.findUnique({
          where: { id },
          include: { design: true },
        });
        if (designImg) {
          design = designImg.design;
        }
      }

      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }

      if (design.userId !== userId) {
        if (design.userId === null) {
          // Claim the design for this user
          await prisma.design.update({
            where: { id: design.id },
            data: { userId },
          });
          logger.info(`Design ${design.id} claimed by User ${userId}`);
        } else {
          logger.warn(`Ownership check failed: Design ${design.id} belongs to ${design.userId}, but user is ${userId}`);
          return res.status(403).json({ message: "You can only submit your own designs" });
        }
      }

      // Update design style pattern if provided
      if (req.body.style) {
        await prisma.design.update({
          where: { id: design.id },
          data: { style: req.body.style },
        });
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
          designId: design.id,
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
      const { id } = req.params; // entry id or design id

      let entry = await prisma.challengeEntry.findUnique({ where: { id } });
      if (!entry) {
        entry = await prisma.challengeEntry.findFirst({
          where: { designId: id },
        });
      }

      if (!entry) {
        return res.status(404).json({ message: "Challenge entry not found" });
      }

      const updated = await prisma.challengeEntry.update({
        where: { id: entry.id },
        data: {
          likes: { increment: 1 },
        },
      });

      return res.json({ likes: updated.likes });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List daily challenge entries (leaderboard)
   */
  static async listChallengeEntries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const entries = await prisma.challengeEntry.findMany({
        where: { challengeDate: today },
        orderBy: { likes: "desc" },
        include: {
          user: {
            include: { profile: true }
          },
          design: {
            include: { images: true }
          }
        }
      });

      return res.json({
        entries: entries.map((entry, index) => {
          // Generate a consistent city from the user ID since city is not stored in user profile
          const cities = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Ahmedabad", "Chennai", "Kolkata", "Hyderabad"];
          let hash = 0;
          const uId = entry.userId;
          for (let i = 0; i < uId.length; i++) {
            hash = uId.charCodeAt(i) + ((hash << 5) - hash);
          }
          const cityIndex = Math.abs(hash) % cities.length;
          const city = cities[cityIndex];

          const colors = ["#FF6B35", "#004E89", "#F7B32B", "#4CAF50", "#E53935"];
          const color = colors[index % colors.length];

          return {
            id: entry.id,
            rank: index + 1,
            name: entry.user.profile?.fullName || "User",
            city: city,
            likes: entry.likes,
            color: color,
            designId: entry.designId,
            imageUri: entry.design.images[0]?.previewUrl || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",
            styleName: entry.design.style,
            roomType: entry.design.roomType,
          };
        })
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTrending(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const styleCounts = await prisma.design.groupBy({
        by: ['style'],
        _count: {
          id: true,
        },
      });

      const communityEntries = await prisma.challengeEntry.findMany({
        take: 20,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            include: { profile: true },
          },
          design: {
            include: { images: true },
          },
        },
      });

      const defaultTrending = [
        { id: "t1", name: "Japandi Fusion", count: "1.2K designs", color: "#F0EBE3" },
        { id: "t2", name: "Kerala Traditional", count: "890 designs", color: "#E8F5E9" },
        { id: "t3", name: "Mumbai Minimalist", count: "2.1K designs", color: "#E3F2FD" },
        { id: "t4", name: "Rajasthani Royal", count: "674 designs", color: "#FFF8E1" },
      ];

      const colors = ["#F0EBE3", "#E8F5E9", "#E3F2FD", "#FFF8E1"];
      const trendingStyles = styleCounts.length > 0 
        ? styleCounts.map((s, i) => ({
            id: `ts_${s.style}`,
            name: `${s.style} Fusion`,
            count: `${s._count.id} designs`,
            color: colors[i % colors.length]
          }))
        : defaultTrending;

      const communityResults = communityEntries.length > 0
        ? communityEntries.map((entry, index) => {
            const cardColors = ["#FF6B35", "#004E89", "#F7B32B", "#4CAF50", "#E53935", "#795548"];
            const cities = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Ahmedabad", "Chennai", "Kolkata", "Hyderabad"];
            
            let hash = 0;
            const uId = entry.userId || "guest";
            for (let i = 0; i < uId.length; i++) {
              hash = uId.charCodeAt(i) + ((hash << 5) - hash);
            }
            const cityIndex = Math.abs(hash) % cities.length;
            
            const rawUrl = entry.design?.images[0]?.previewUrl;
            const imageUri = rawUrl
              ? (rawUrl.startsWith("http") ? rawUrl : `${env.BACKEND_URL}/uploads/previews/${rawUrl}`)
              : "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600";

            return {
              id: entry.designId,
              user: entry.user?.profile?.fullName || "Designer",
              city: cities[cityIndex],
              likes: entry.likes, // Real likes count from ChallengeEntry table
              style: entry.design?.style || "Modern",
              room: entry.design?.roomType || "Living Room",
              color: cardColors[index % cardColors.length],
              imageUri: imageUri,
            };
          })
        : [
            { id: "1", user: "Priya M", city: "Mumbai", likes: 243, style: "Modern", room: "Living Room", color: "#FF6B35", imageUri: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600" },
            { id: "2", user: "Raj K", city: "Bengaluru", likes: 189, style: "Minimal", room: "Bedroom", color: "#004E89", imageUri: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600" },
            { id: "3", user: "Anjali S", city: "Jaipur", likes: 412, style: "Traditional", room: "Kitchen", color: "#F7B32B", imageUri: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600" },
            { id: "4", user: "Vikram P", city: "Delhi", likes: 97, style: "Industrial", room: "Living Room", color: "#4CAF50", imageUri: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600" },
          ];

      return res.json({
        trendingStyles,
        communityDesigns: communityResults
      });
    } catch (error) {
      next(error);
    }
  }
}
