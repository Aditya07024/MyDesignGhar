import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { clerkClient, getAuth } from "@clerk/express";
import crypto from "crypto";
import { logger } from "../utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    clerkId: string;
    phone: string;
    email: string | null;
    role: "USER" | "CONSULTANT" | "ADMIN" | "SUPER_ADMIN";
    referralCode?: string;
  };
  auth?: {
    userId: string;
  };
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authState = getAuth(req);
    const clerkId = authState?.userId || req.auth?.userId;

    if (!clerkId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let user = await prisma.user.findUnique({
      where: { clerkId },
      include: { profile: true, wallet: true },
    });

    if (!user) {
      // Lazy-create user in PostgreSQL using details from Clerk
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        
        // Extract phone number: prioritize primary or first, fallback to mock/random format if missing
        const hasRealPhone = clerkUser.phoneNumbers && clerkUser.phoneNumbers.length > 0;
        const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || null;
        const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User";
        const avatarUrl = clerkUser.imageUrl || null;
        const referralCode = `MDG-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

        user = await prisma.$transaction(async (tx: any) => {
          // Double check in transaction to prevent concurrency conflicts
          const existing = await tx.user.findUnique({
            where: { clerkId },
            include: { profile: true, wallet: true },
          });
          if (existing) return existing;

          return await tx.user.create({
            data: {
              clerkId,
              phone,
              email,
              referralCode,
              isPhoneVerified: !!hasRealPhone,
              profile: {
                create: {
                  fullName,
                  avatarUrl,
                },
              },
              wallet: {
                create: {
                  balance: 0.0,
                },
              },
            },
            include: {
              profile: true,
              wallet: true,
            },
          });
        });

        logger.info(`Lazy-created local user record for Clerk ID: ${clerkId}`);
      } catch (err: any) {
        try {
          const retryUser = await prisma.user.findUnique({
            where: { clerkId },
            include: { profile: true, wallet: true },
          });
          if (retryUser) {
            user = retryUser;
            logger.info(`Resolved concurrent lazy-create conflict for Clerk ID: ${clerkId}`);
          } else {
            throw err;
          }
        } catch (retryErr) {
          logger.error(`Clerk Authentication failure during lazy-create: ${err.message}`);
          return res.status(401).json({ message: "Clerk user synchronization failed" });
        }
      }
    }

    req.user = {
      id: user!.id,
      clerkId: user!.clerkId,
      phone: user!.phone,
      email: user!.email,
      role: user!.role as any,
      referralCode: user!.referralCode,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: (string | string[])[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const flattenedRoles = roles.flat();
    if (!req.user || !flattenedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}
