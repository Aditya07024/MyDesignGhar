import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

interface Signal {
  senderId: string;
  data: any;
  timestamp: number;
}

// In-memory signals store: bookingId -> Signal[]
const sessionSignals: Record<string, Signal[]> = {};

export class WebRTCController {
  /**
   * Post SDP offer, answer, or ICE candidate for a booking session
   */
  static async postSignal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id: bookingId } = req.params;
      const userId = req.user!.id;
      const { data } = req.body;

      if (!data) {
        return res.status(400).json({ message: "Signal data is required" });
      }

      // Verify the booking exists and the user is part of the booking
      const booking = await prisma.consultationBooking.findUnique({
        where: { id: bookingId },
        include: { consultant: true },
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const isClient = booking.userId === userId;
      const isConsultant = booking.consultant.userId === userId;

      if (!isClient && !isConsultant) {
        return res.status(403).json({ message: "Unauthorized to access this session" });
      }

      if (!sessionSignals[bookingId]) {
        sessionSignals[bookingId] = [];
      }

      const signal: Signal = {
        senderId: userId,
        data,
        timestamp: Date.now(),
      };

      sessionSignals[bookingId].push(signal);

      // Keep only last 100 signals to prevent memory leaks
      if (sessionSignals[bookingId].length > 100) {
        sessionSignals[bookingId] = sessionSignals[bookingId].slice(-100);
      }

      return res.status(201).json({ message: "Signal posted successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch incoming SDP offers, answers, or ICE candidates from the other peer
   */
  static async getSignals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id: bookingId } = req.params;
      const userId = req.user!.id;
      const lastIndex = parseInt(req.query.lastIndex as string || "-1", 10);

      // Verify the booking exists and the user is part of the booking
      const booking = await prisma.consultationBooking.findUnique({
        where: { id: bookingId },
        include: { consultant: true },
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const isClient = booking.userId === userId;
      const isConsultant = booking.consultant.userId === userId;

      if (!isClient && !isConsultant) {
        return res.status(403).json({ message: "Unauthorized to access this session" });
      }

      const signals = sessionSignals[bookingId] || [];
      
      // Filter out signals sent by the requester, and only return signals after lastIndex
      const newSignals = signals
        .map((sig, idx) => ({ index: idx, ...sig }))
        .filter((sig) => sig.senderId !== userId && sig.index > lastIndex);

      return res.json({ signals: newSignals });
    } catch (error) {
      next(error);
    }
  }
}
