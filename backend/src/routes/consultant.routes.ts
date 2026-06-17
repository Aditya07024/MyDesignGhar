import { Router } from "express";
import { ConsultantController } from "../controllers/consultant.controller";
import { validate } from "../middlewares/validation.middleware";
import {
  consultantRegisterSchema,
  createBookingSchema,
  addReviewSchema,
} from "../validators/schemas";
import { authenticate } from "../middlewares/auth.middleware";
import { WebRTCController } from "../controllers/webrtc.controller";

const router = Router();

// Registration and Directory search
router.post("/register", validate(consultantRegisterSchema), authenticate as any, ConsultantController.register as any);
router.get("/", authenticate as any, ConsultantController.list as any);
router.get("/:id", authenticate as any, ConsultantController.getById as any);

// Availability slot creation (Consultant only)
router.post("/slots", authenticate as any, ConsultantController.addAvailabilitySlots as any);

// Bookings and Session Video Meetings
router.post("/bookings", validate(createBookingSchema), authenticate as any, ConsultantController.createBooking as any);
router.post("/bookings/:id/notes", authenticate as any, ConsultantController.addSessionNotes as any);
router.get("/bookings/sessions", authenticate as any, ConsultantController.listBookings as any);

// WebRTC Signaling
router.post("/bookings/:id/signal", authenticate as any, WebRTCController.postSignal as any);
router.get("/bookings/:id/signals", authenticate as any, WebRTCController.getSignals as any);

// Reviews
router.post("/:id/review", validate(addReviewSchema), authenticate as any, ConsultantController.addReview as any);

export default router;
