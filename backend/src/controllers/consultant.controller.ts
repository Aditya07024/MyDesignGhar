import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { WalletService } from "../services/wallet.service";
import { PaymentService } from "../services/payment.service";
import { VideoService } from "../services/video.service";
import { NotificationService } from "../services/notification.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Role, ConsultantStatus, BookingStatus, TransactionCategory } from "@prisma/client";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export class ConsultantController {
  /**
   * Register as consultant
   */
  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { specialty, experience, bio, price, portfolioUrls } = req.body;

      const existing = await prisma.consultant.findUnique({ where: { userId } });
      if (existing) {
        logger.error(`Register failed for User ${userId}: already registered as consultant`);
        return res.status(400).json({ message: "You have already registered as a consultant" });
      }

      const consultant = await prisma.$transaction(async (tx) => {
        // Upgrade role
        await tx.user.update({
          where: { id: userId },
          data: { role: Role.CONSULTANT, isRoleLocked: true },
        });

        // Create consultant profile
        const profile = await tx.consultant.create({
          data: {
            userId,
            specialty,
            experience,
            bio,
            price,
            status: ConsultantStatus.PENDING,
          },
        });

        // Insert portfolio links
        if (portfolioUrls && portfolioUrls.length > 0) {
          await tx.consultantPortfolio.createMany({
            data: portfolioUrls.map((url: string) => ({
              consultantId: profile.id,
              imageUrl: url,
            })),
          });
        }

        return profile;
      });

      return res.status(201).json({
        message: "Consultant application submitted. Pending admin approval.",
        consultant,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List approved consultants
   */
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let list = await prisma.consultant.findMany({
        where: { status: ConsultantStatus.APPROVED, deletedAt: null },
        include: {
          user: {
            select: {
              profile: {
                select: { fullName: true, avatarUrl: true },
              },
            },
          },
          reviews: {
            select: { rating: true },
          },
        },
      });

      if (list.length === 0) {
        const seedData = [
          {
            clerkId: "mock-clerk-c1",
            phone: "+919876543210",
            email: "priya@mydesignghar.com",
            fullName: "Priya Sharma",
            avatarUrl: "priya",
            specialty: "Luxury & Modern",
            experience: 8,
            bio: "Award-winning designer crafting warm, liveable luxury spaces across Mumbai and Pune.",
            price: 1499,
          },
          {
            clerkId: "mock-clerk-c2",
            phone: "+919876543211",
            email: "rohan@mydesignghar.com",
            fullName: "Rohan Mehta",
            avatarUrl: "rohan",
            specialty: "Rajasthani Heritage",
            experience: 6,
            bio: "Blends traditional Jaipur craftsmanship with contemporary comfort.",
            price: 999,
          },
          {
            clerkId: "mock-clerk-c3",
            phone: "+919876543212",
            email: "ananya@mydesignghar.com",
            fullName: "Ananya Nair",
            avatarUrl: "ananya",
            specialty: "Kerala & Coastal",
            experience: 5,
            bio: "Specialist in airy, tropical interiors using natural wood and stone.",
            price: 1199,
          },
          {
            clerkId: "mock-clerk-c4",
            phone: "+919876543213",
            email: "vikram@mydesignghar.com",
            fullName: "Vikram Singh",
            avatarUrl: "vikram",
            specialty: "Minimalist & Japandi",
            experience: 10,
            bio: "Decade of experience designing calm, clutter-free urban homes.",
            price: 1799,
          },
        ];

        for (const data of seedData) {
          const existingUser = await prisma.user.findUnique({
            where: { phone: data.phone }
          });
          if (!existingUser) {
            await prisma.user.create({
              data: {
                clerkId: data.clerkId,
                phone: data.phone,
                email: data.email,
                role: Role.CONSULTANT,
                referralCode: `MDG-${data.avatarUrl.toUpperCase()}`,
                profile: {
                  create: {
                    fullName: data.fullName,
                    avatarUrl: data.avatarUrl,
                  },
                },
                consultantProfile: {
                  create: {
                    specialty: data.specialty,
                    experience: data.experience,
                    bio: data.bio,
                    price: data.price,
                    status: ConsultantStatus.APPROVED,
                    isApproved: true,
                  },
                },
              },
            });
          }
        }

        list = await prisma.consultant.findMany({
          where: { status: ConsultantStatus.APPROVED, deletedAt: null },
          include: {
            user: {
              select: {
                profile: {
                  select: { fullName: true, avatarUrl: true },
                },
              },
            },
            reviews: {
              select: { rating: true },
            },
          },
        });
      }

      const formatted = list.map((c) => {
        const ratingSum = c.reviews.reduce((acc, r) => acc + r.rating, 0);
        const avgRating = c.reviews.length > 0 ? ratingSum / c.reviews.length : 5.0;

        return {
          id: c.id,
          name: c.user.profile?.fullName || "Specialist Designer",
          avatarUrl: c.user.profile?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${c.id}`,
          specialty: c.specialty,
          experience: c.experience,
          bio: c.bio,
          price: c.price,
          rating: parseFloat(avgRating.toFixed(1)),
          reviewsCount: c.reviews.length,
        };
      });

      return res.json({ consultants: formatted });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get consultant details & slot calendars
   */
  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const c = await prisma.consultant.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              profile: {
                select: { fullName: true, avatarUrl: true },
              },
            },
          },
          portfolios: true,
          availability: {
            where: { isBooked: false, date: { gte: new Date() } },
            orderBy: { date: "asc" },
          },
          reviews: {
            include: {
              user: {
                select: {
                  profile: { select: { fullName: true } },
                },
              },
            },
          },
        },
      });

      if (!c || c.deletedAt || c.status !== ConsultantStatus.APPROVED) {
        return res.status(404).json({ message: "Consultant not found" });
      }

      const ratingSum = c.reviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = c.reviews.length > 0 ? ratingSum / c.reviews.length : 5.0;

      return res.json({
        consultant: {
          id: c.id,
          name: c.user.profile?.fullName || "Designer",
          avatarUrl: c.user.profile?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${c.id}`,
          specialty: c.specialty,
          experience: c.experience,
          bio: c.bio,
          price: c.price,
          rating: parseFloat(avgRating.toFixed(1)),
          reviewsCount: c.reviews.length,
          portfolio: c.portfolios.map((p) => p.imageUrl),
          availability: c.availability.map((a) => ({
            id: a.id,
            date: a.date,
            timeSlot: a.timeSlot,
          })),
          reviews: c.reviews.map((r) => ({
            id: r.id,
            name: r.user.profile?.fullName || "Client",
            rating: r.rating,
            text: r.text,
            createdAt: r.createdAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set availability slots (For Consultants)
   */
  static async addAvailabilitySlots(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { slots } = req.body; // array of { date: string, timeSlot: string }

      const consultant = await prisma.consultant.findUnique({ where: { userId } });
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }

      const dataToInsert = slots.map((s: { date: string; timeSlot: string }) => ({
        consultantId: consultant.id,
        date: new Date(s.date),
        timeSlot: s.timeSlot,
      }));

      await prisma.consultantAvailability.createMany({
        data: dataToInsert,
      });

      return res.status(201).json({ message: "Availability slots updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Book a slot
   */
  static async createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { consultantId, availabilityId, paymentMethod } = req.body;
      const userId = req.user!.id;

      // Validate slot availability
      const slot = await prisma.consultantAvailability.findUnique({
        where: { id: availabilityId },
        include: { consultant: true },
      });

      if (!slot || slot.isBooked || slot.consultantId !== consultantId) {
        return res.status(400).json({ message: "Selected time slot is unavailable" });
      }

      const amount = slot.consultant.price;

      // 1. Wallet Payment flow
      if (paymentMethod === "WALLET") {
        const result = await prisma.$transaction(async (tx) => {
          // Debit wallet balance
          await WalletService.debit(
            userId,
            amount,
            TransactionCategory.PAY_CONSULTATION,
            availabilityId,
            `Consultation Booking (ID: ${consultantId.substring(0, 8)})`
          );

          // Generate Daily.co video room URL
          const videoInfo = await VideoService.createMeetingRoom(availabilityId);

          const booking = await tx.consultationBooking.create({
            data: {
              consultantId,
              userId,
              availabilityId,
              amount,
              paymentMethod,
              status: BookingStatus.CONFIRMED,
              dailyRoomName: videoInfo.roomName,
              dailyRoomUrl: videoInfo.roomUrl,
            },
          });

          // Mark slot as booked
          await tx.consultantAvailability.update({
            where: { id: availabilityId },
            data: { isBooked: true },
          });

          return booking;
        });

        await NotificationService.sendNotification(
          userId,
          "Consultation Confirmed",
          `Your session is confirmed at ${slot.timeSlot} on ${new Date(slot.date).toDateString()}`,
          "reminder"
        );

        // Notify the consultant
        try {
          await NotificationService.sendNotification(
            slot.consultant.userId,
            "New Session Booked",
            `You have a new video consultation booked at ${slot.timeSlot} on ${new Date(slot.date).toDateString()}`,
            "reminder"
          );
        } catch (nErr: any) {
          logger.error(`Notification trigger failed for consultant: ${nErr.message}`);
        }

        return res.status(201).json({
          message: "Consultation booked successfully using Wallet credit",
          booking: result,
        });
      }

      // 2. Razorpay direct checkout flow
      const receiptId = `booking_${userId.substring(0, 8)}_${availabilityId.substring(0, 8)}`;
      const booking = await prisma.consultationBooking.create({
        data: {
          consultantId,
          userId,
          availabilityId,
          amount,
          paymentMethod,
          status: BookingStatus.PENDING,
        },
      });

      const order = await PaymentService.createOrder(amount, receiptId);

      await prisma.consultationBooking.update({
        where: { id: booking.id },
        data: { razorpayOrderId: order.id },
      });

      return res.status(201).json({
        message: "Payment order prepared",
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId: booking.id,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Post consultation session notes (Only accessible by Consultant assigned)
   */
  static async addSessionNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // booking id
      const { notes } = req.body;
      const userId = req.user!.id;

      const booking = await prisma.consultationBooking.findUnique({
        where: { id },
        include: { consultant: true },
      });

      if (!booking) {
        return res.status(404).json({ message: "Consultation booking not found" });
      }

      // Verify booking belongs to the requesting consultant
      if (booking.consultant.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to log notes for this meeting" });
      }

      const note = await prisma.consultationNote.upsert({
        where: { bookingId: id },
        update: { notes },
        create: {
          bookingId: id,
          notes,
        },
      });

      // Send a notification to the client user
      try {
        await NotificationService.sendNotification(
          booking.userId,
          "Session Notes Shared",
          `Your designer has shared session notes for your consultation booking.`,
          "reminder"
        );
      } catch (nErr: any) {
        logger.error(`Notification trigger failed for client after session notes: ${nErr.message}`);
      }

      return res.json({ message: "Session notes updated successfully", note });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch Booking list
   */
  static async listBookings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;

      let bookings: any[];
      if (role === Role.CONSULTANT) {
        const consultant = await prisma.consultant.findUnique({ where: { userId } });
        if (!consultant) {
          bookings = [];
        } else {
          bookings = await prisma.consultationBooking.findMany({
            where: { consultantId: consultant.id },
            include: {
              user: { select: { profile: { select: { fullName: true } } } },
              availability: true,
              notes: true,
            },
            orderBy: { createdAt: "desc" },
          });
        }
      } else {
        bookings = await prisma.consultationBooking.findMany({
          where: { userId },
          include: {
            consultant: {
              include: {
                user: { select: { profile: { select: { fullName: true } } } },
              },
            },
            availability: true,
            notes: true,
          },
          orderBy: { createdAt: "desc" },
        });
      }

      // Get the requesting user's profile to resolve their name in the LiveKit room
      const userProfile = await prisma.profile.findUnique({
        where: { userId },
        select: { fullName: true },
      });
      const participantName = userProfile?.fullName || (role === Role.CONSULTANT ? "Specialist Consultant" : "Client User");

      const formatted = await Promise.all(
        bookings.map(async (b: any) => {
          let dailyRoomUrl = b.dailyRoomUrl;

          // If session is confirmed and has a valid LiveKit room, generate a secure token
          if (b.status === BookingStatus.CONFIRMED && b.dailyRoomName) {
            try {
              const token = await VideoService.generateToken(
                b.dailyRoomName,
                userId,
                participantName
              );
              dailyRoomUrl = `/call?id=${b.id}&token=${token}&url=${env.LIVEKIT_URL}`;
            } catch (err: any) {
              logger.error(`LiveKit token generation failed for booking ${b.id}: ${err.message}`);
            }
          }

          return {
            id: b.id,
            name: role === Role.CONSULTANT ? b.user.profile?.fullName : b.consultant.user.profile?.fullName,
            date: b.availability.date,
            time: b.availability.timeSlot,
            status: b.status,
            dailyRoomUrl,
            amount: b.amount,
            notes: b.notes?.notes || null,
          };
        })
      );

      return res.json({ bookings: formatted });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Leave a review
   */
  static async addReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // consultant id
      const { rating, text } = req.body;
      const userId = req.user!.id;

      // Validate review author had a booking with this designer
      const hasBooked = await prisma.consultationBooking.findFirst({
        where: { consultantId: id, userId, status: BookingStatus.COMPLETED },
      });

      // Let's make it friendly for testing (allow review if they booked or if they are in dev)
      if (!hasBooked && env.NODE_ENV === "production") {
        return res.status(403).json({ message: "You can only review designers you have had complete sessions with." });
      }

      const review = await prisma.consultantReview.create({
        data: {
          consultantId: id,
          userId,
          rating,
          text,
        },
      });

      return res.status(201).json({ message: "Review posted successfully", review });
    } catch (error) {
      next(error);
    }
  }
}
