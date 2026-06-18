import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    referralCode: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    password: z.string().min(4, "Password must be at least 4 characters"),
  }),
});

export const generateDesignSchema = z.object({
  body: z.object({
    style: z.string().min(1, "Design style is required"),
    roomType: z.string().min(1, "Room type is required"),
    budget: z.string().min(1, "Budget tier is required"),
    customKeywords: z.string().optional(),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
  }),
});

export const topUpWalletSchema = z.object({
  body: z.object({
    amount: z.number().min(100, "Minimum top up amount is ₹100"),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    consultantId: z.string().uuid("Invalid consultant ID"),
    availabilityId: z.string().uuid("Invalid slot ID"),
    paymentMethod: z.enum(["WALLET", "RAZORPAY"]),
  }),
});

export const addReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    text: z.string().min(3, "Review text must be at least 3 characters"),
  }),
});

export const consultantRegisterSchema = z.object({
  body: z.object({
    specialty: z.string().min(2, "Specialty description is required"),
    experience: z.number().int().min(0, "Experience must be non-negative"),
    bio: z.string().min(10, "Bio must be at least 10 characters"),
    price: z.number().positive("Consultation price must be positive"),
    portfolioUrls: z
      .array(
        z
          .string()
          .transform((val) => {
            const trimmed = val.trim();
            if (trimmed && !/^https?:\/\//i.test(trimmed)) {
              return `https://${trimmed}`;
            }
            return trimmed;
          })
          .pipe(z.string().url("Invalid portfolio image URL"))
      )
      .optional(),
  }),
});

export const postAffiliateProductSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    price: z.number().optional(),
    imageUrl: z.string().url().optional(),
    link: z.string().url("Invalid affiliate link URL"),
    category: z.string().min(1),
  }),
});
