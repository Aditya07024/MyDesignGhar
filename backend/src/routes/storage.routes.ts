import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const router = Router();
const UPLOADS_BASE_DIR = path.join(process.cwd(), "uploads");

/**
 * Endpoint to serve private files using HMAC signed URLs
 * GET /api/storage/secure-file
 */
router.get("/secure-file", (req: Request, res: Response) => {
  try {
    const { bucket, path: filePath, expires, signature } = req.query;

    if (!bucket || !filePath || !expires || !signature) {
      return res.status(400).json({ message: "Missing required signature parameters" });
    }

    // 1. Check expiration
    const expiresTimestamp = parseInt(expires as string, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (isNaN(expiresTimestamp) || currentTimestamp > expiresTimestamp) {
      return res.status(403).json({ message: "Signed URL has expired" });
    }

    // 2. Validate cryptographic signature
    const dataToSign = `${bucket}:${filePath}:${expires}`;
    const secret = env.JWT_SECRET || "local-storage-fallback-secret-key-123456";
    
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(dataToSign)
      .digest("hex");

    if (signature !== expectedSignature) {
      logger.warn(`Failed signature verification for path: ${filePath}`);
      return res.status(403).json({ message: "Invalid signature" });
    }

    // 3. Resolve absolute file path
    const absoluteFilePath = path.join(UPLOADS_BASE_DIR, bucket as string, filePath as string);

    // Prevent directory traversal attacks (ensure target path is inside the uploads dir)
    if (!absoluteFilePath.startsWith(UPLOADS_BASE_DIR)) {
      logger.error(`Directory traversal attempt detected: ${filePath}`);
      return res.status(400).json({ message: "Invalid file path" });
    }

    // 4. Send the file
    if (!fs.existsSync(absoluteFilePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.sendFile(absoluteFilePath);
  } catch (error: any) {
    logger.error(`Error serving secure file: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
