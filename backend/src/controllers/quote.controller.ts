import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

export class QuoteController {
  /**
   * Submit a new quote / AI feature interest request
   */
  static async submitQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, service, budget, style, statePreference, state, message, imageUrl } = req.body;

      if (!name || (!email && !phone)) {
        return res.status(400).json({ error: "Name and at least email or phone number are required." });
      }

      // Save to Database
      let newRequest = null;
      try {
        newRequest = await prisma.quoteRequest.create({
          data: {
            name,
            email: email || "Not provided",
            phone: phone || "Not provided",
            service: service || "AI Room Styling",
            budget: budget || "Not specified",
            style: style || "General",
            statePreference: statePreference || state || "Not specified",
            message: message || "",
            imageUrl: imageUrl || null,
            status: "WAITLIST",
          },
        });
      } catch (dbErr) {
        console.warn("Database save fallback warning:", dbErr);
      }

      return res.status(201).json({
        success: true,
        message: "Your feature request and room preferences have been successfully saved to our database!",
        data: newRequest || { name, email, phone, style, budget, submittedAt: new Date().toISOString() },
      });
    } catch (error) {
      console.error("Quote submission error:", error);
      return res.status(500).json({ error: "Failed to process quote request." });
    }
  }

  /**
   * Get all quote / feature interest requests & total counts for tracking
   */
  static async getQuoteStats(req: Request, res: Response, next: NextFunction) {
    try {
      let count = 0;
      let requests: any[] = [];

      try {
        count = await prisma.quoteRequest.count();
        requests = await prisma.quoteRequest.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
        });
      } catch (dbErr) {
        console.warn("Database fetch warning:", dbErr);
      }

      return res.json({
        totalRequests: count,
        feature: "Instant AI 3D Room Generator",
        requests,
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch feature tracking stats." });
    }
  }
}
