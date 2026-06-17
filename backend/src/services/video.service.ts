import { AccessToken } from "livekit-server-sdk";
import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export class VideoService {
  /**
   * Create a standard room metadata
   * In LiveKit, rooms are created on the fly when the first participant joins using the token.
   */
  static async createMeetingRoom(bookingId: string): Promise<{ roomName: string; roomUrl: string }> {
    const roomName = `mdg-${bookingId.substring(0, 8)}-${crypto.randomBytes(4).toString("hex")}`;
    return {
      roomName,
      roomUrl: `/call?id=${bookingId}`, // Placeholder route to trigger local client navigation
    };
  }

  /**
   * Generate secure access token for a participant to join a LiveKit room
   */
  static async generateToken(
    roomName: string,
    participantId: string,
    participantName: string
  ): Promise<string> {
    try {
      const apiKey = env.LIVEKIT_API_KEY;
      const apiSecret = env.LIVEKIT_API_SECRET;

      if (!apiKey || !apiSecret) {
        throw new Error("LiveKit API keys are not configured in environment variables.");
      }

      // Create token valid for 2 hours (7200 seconds)
      const at = new AccessToken(apiKey, apiSecret, {
        identity: participantId,
        name: participantName,
        ttl: 7200,
      });

      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
      });

      return await at.toJwt();
    } catch (error: any) {
      logger.error(`LiveKit token generation failed: ${error.message || error}`);
      throw new Error(`Failed to generate video room token: ${error.message}`);
    }
  }

  /**
   * Delete room metadata
   * In LiveKit, rooms are cleaned up automatically when empty.
   */
  static async deleteMeetingRoom(roomName: string): Promise<void> {
    logger.info(`LiveKit room ${roomName} will automatically close when empty.`);
  }
}
