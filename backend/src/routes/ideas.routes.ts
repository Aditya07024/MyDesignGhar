import { Router } from "express";
import { IdeasController } from "../controllers/ideas.controller";

const router = Router();

// GET /api/ideas - Fetch all community ideas
router.get("/", IdeasController.getAllIdeas);

// POST /api/ideas - Submit a new dream house vision
router.post("/", IdeasController.createIdea);

// POST /api/ideas/:id/like - Like/upvote a community idea
router.post("/:id/like", IdeasController.likeIdea);

export default router;
