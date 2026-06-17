import fs from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const UPLOADS_BASE_DIR = path.join(process.cwd(), "uploads");

export class StorageService {
  /**
   * Upload buffer to local storage directory
   */
  static async uploadBuffer(
    buffer: Buffer,
    bucketName: string,
    filePath: string,
    contentType: string = "image/jpeg"
  ): Promise<string> {
    try {
      const destinationPath = path.join(UPLOADS_BASE_DIR, bucketName, filePath);
      const directory = path.dirname(destinationPath);

      // Ensure that parent directories exist
      fs.mkdirSync(directory, { recursive: true });

      // Write buffer to file
      fs.writeFileSync(destinationPath, buffer);

      logger.info(`Successfully saved file locally to ${bucketName}/${filePath}`);

      // Return local server absolute URL
      return `${env.BACKEND_URL}/uploads/${bucketName}/${filePath}`;
    } catch (error: any) {
      logger.error(`Error uploading buffer locally to ${bucketName}/${filePath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate secure, short-lived signed URL for private files
   */
  static async getSignedUrl(
    bucketName: string,
    filePath: string,
    expiresInSeconds: number = 3600
  ): Promise<string> {
    try {
      const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
      const dataToSign = `${bucketName}:${filePath}:${expires}`;
      
      const secret = env.JWT_SECRET || "local-storage-fallback-secret-key-123456";
      const signature = crypto
        .createHmac("sha256", secret)
        .update(dataToSign)
        .digest("hex");

      // Return the secure file endpoint URL with query params for validation
      const params = new URLSearchParams({
        bucket: bucketName,
        path: filePath,
        expires: expires.toString(),
        signature: signature,
      });

      return `${env.BACKEND_URL}/api/storage/secure-file?${params.toString()}`;
    } catch (error: any) {
      logger.error(`Error generating signed URL for ${bucketName}/${filePath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete file from local storage
   */
  static async deleteFile(bucketName: string, filePath: string): Promise<void> {
    try {
      const targetPath = path.join(UPLOADS_BASE_DIR, bucketName, filePath);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        logger.info(`Successfully deleted local file at ${bucketName}/${filePath}`);
      } else {
        logger.warn(`Attempted to delete local file but it does not exist: ${bucketName}/${filePath}`);
      }
    } catch (error: any) {
      logger.error(`Error deleting local file from ${bucketName}/${filePath}: ${error.message}`);
    }
  }
}
