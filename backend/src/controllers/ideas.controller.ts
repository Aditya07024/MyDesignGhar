import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

interface IdeaItem {
  id: string;
  name: string;
  location: string;
  roomType: string;
  style: string;
  vision: string;
  likes: number;
  date: string;
  createdAt?: string;
}

const seedIdeas: IdeaItem[] = [
  {
    id: "demo-1",
    name: "Aarav & Meera K.",
    location: "Bengaluru, KA",
    roomType: "Modular Kitchen",
    style: "Warm Teak & Quartz",
    vision: "A crisp kitchen with warm teak wood lower cabinets, seamless white quartz countertop, ambient under-cabinet LED bar, and a hidden pull-out pantry unit for tight urban spaces.",
    likes: 42,
    date: "2 hours ago",
  },
  {
    id: "demo-2",
    name: "Rohan Deshmukh",
    location: "Pune, MH",
    roomType: "Master Bedroom",
    style: "Scandinavian Light",
    vision: "A minimalist bedroom suite with acoustic wooden slat headboard paneling, soft warm dimmable recessed lights, built-in floating side tables, and neutral linen curtains.",
    likes: 38,
    date: "5 hours ago",
  },
  {
    id: "demo-3",
    name: "Ananya & Vikram",
    location: "New Delhi, DL",
    roomType: "Living & Dining",
    style: "Heritage Brass & Marble",
    vision: "An open-plan living room featuring Italian beige marble flooring, brass inlaid accent walls, plush cognac leather sofa, and biophilic indoor greenery corners.",
    likes: 56,
    date: "1 day ago",
  },
  {
    id: "demo-4",
    name: "Priya Iyer",
    location: "Kochi, KL",
    roomType: "Pooja & Mandir",
    style: "Kerala Teak & Brass",
    vision: "A serene pooja alcove crafted with solid Kerala teakwood, hand-carved bell lattice doors, back-lit warm golden stone wall, and brass brassware niches.",
    likes: 29,
    date: "2 days ago",
  },
  {
    id: "demo-5",
    name: "Siddharth Roy",
    location: "Kolkata, WB",
    roomType: "Home Office",
    style: "Modern Industrial",
    vision: "An ergonomic home study with matte black metal framing, rich walnut floating desk, ambient backlight bar, and floor-to-ceiling book display racks.",
    likes: 31,
    date: "3 days ago",
  },
];

// In-memory fallback array for custom user submissions when database is offline
const memorySubmissions: IdeaItem[] = [];

export class IdeasController {
  /**
   * Get all community dream house ideas
   */
  static async getAllIdeas(_req: Request, res: Response, _next: NextFunction) {
    try {
      let dbIdeas: IdeaItem[] = [];
      try {
        const records = await prisma.communityIdea.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
        });

        dbIdeas = records.map((rec) => ({
          id: rec.id,
          name: rec.name,
          location: rec.location,
          roomType: rec.roomType,
          style: rec.style,
          vision: rec.vision,
          likes: rec.likes,
          date: "Recently",
          createdAt: rec.createdAt.toISOString(),
        }));
      } catch (dbErr) {
        console.warn("Prisma db fetch warning, using memory fallback:", dbErr);
      }

      // Merge memory submissions + DB ideas + seed ideas
      const allIdeas = [...memorySubmissions, ...dbIdeas, ...seedIdeas];

      return res.json({
        success: true,
        count: allIdeas.length,
        ideas: allIdeas,
      });
    } catch (error) {
      console.error("Error fetching community ideas:", error);
      return res.status(500).json({ error: "Failed to fetch community ideas." });
    }
  }

  /**
   * Submit a new dream house vision
   */
  static async createIdea(req: Request, res: Response, _next: NextFunction) {
    try {
      const { name, location, roomType, style, vision } = req.body;

      if (!name || !vision) {
        return res.status(400).json({ error: "Name and dream vision description are required." });
      }

      const ideaData: IdeaItem = {
        id: `idea-${Date.now()}`,
        name,
        location: location || "India",
        roomType: roomType || "Modular Kitchen",
        style: style || "Modern Minimalist",
        vision,
        likes: 1,
        date: "Just now",
      };

      try {
        const record = await prisma.communityIdea.create({
          data: {
            name: ideaData.name,
            location: ideaData.location,
            roomType: ideaData.roomType,
            style: ideaData.style,
            vision: ideaData.vision,
            likes: ideaData.likes,
          },
        });
        ideaData.id = record.id;
      } catch (dbErr) {
        console.warn("Prisma db save warning, saved to memory fallback:", dbErr);
        memorySubmissions.unshift(ideaData);
      }

      return res.status(201).json({
        success: true,
        message: "Your dream house vision has been published to the community!",
        idea: ideaData,
      });
    } catch (error) {
      console.error("Error creating community idea:", error);
      return res.status(500).json({ error: "Failed to submit dream vision." });
    }
  }

  /**
   * Upvote / like an idea by ID
   */
  static async likeIdea(req: Request, res: Response, _next: NextFunction) {
    try {
      const { id } = req.params;

      // Check in-memory first
      const memIdea = memorySubmissions.find((i) => i.id === id);
      if (memIdea) {
        memIdea.likes += 1;
        return res.json({ success: true, likes: memIdea.likes });
      }

      // Check seed ideas
      const seedIdea = seedIdeas.find((i) => i.id === id);
      if (seedIdea) {
        seedIdea.likes += 1;
        return res.json({ success: true, likes: seedIdea.likes });
      }

      // Try database update
      try {
        const updated = await prisma.communityIdea.update({
          where: { id },
          data: { likes: { increment: 1 } },
        });
        return res.json({ success: true, likes: updated.likes });
      } catch (dbErr) {
        console.warn("Database like update warning:", dbErr);
      }

      return res.json({ success: true, likes: 1 });
    } catch (error) {
      return res.status(500).json({ error: "Failed to register like." });
    }
  }
}
