import { Router } from "express";
import { QuoteController } from "../controllers/quote.controller";

const router = Router();

// Public route to submit feature interest & quote requests
router.post("/", QuoteController.submitQuote);

// Route to check total user feature interest counts
router.get("/stats", QuoteController.getQuoteStats);

export default router;
