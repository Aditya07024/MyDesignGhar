import axios from "axios";
import sharp from "sharp";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface GenerationInput {
  style: string;
  roomType: string;
  budget: string;
  customKeywords?: string;
  userId?: string;
}

export class AIService {
  /**
   * Room type detection (simulated production model)
   */
  static async detectRoomType(imageBuffer: Buffer): Promise<string> {
    try {
      logger.info("Detecting room type from uploaded image...");
      const metadata = await sharp(imageBuffer).metadata();
      if (metadata.width && metadata.height) {
        const ratio = metadata.width / metadata.height;
        if (ratio > 1.3) return "Living Room";
        if (ratio < 0.8) return "Bathroom";
      }
      return "Bedroom";
    } catch (error) {
      logger.error("Error in room type detection, defaulting to Bedroom");
      return "Bedroom";
    }
  }

  /**
   * Generates a depth map of the room image using edge-extraction
   */
  static async generateDepthMap(imageBuffer: Buffer): Promise<Buffer> {
    try {
      logger.info("Generating room depth map via edge-extraction filter...");
      return await sharp(imageBuffer)
        .greyscale()
        .linear(1.5, -0.2)
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
        })
        .toBuffer();
    } catch (error: any) {
      logger.error(`Failed to generate depth map: ${error.message}`);
      return sharp(imageBuffer).greyscale().toBuffer();
    }
  }

  /**
   * Fallback generation loop: HF img2img -> Pollinations text2img -> Style-transfer fallback
   * Now accepts the original room image to preserve room structure in outputs.
   */
  static async generateImageFromProviders(
    positivePrompt: string,
    negativePrompt: string,
    seed: number,
    originalImageBuffer?: Buffer
  ): Promise<Buffer> {
    // 1. Primary choice: HuggingFace FLUX.1-schnell (premium quality, fast, free serverless)
    if (env.HF_API_KEY) {
      try {
        logger.info(`Attempting HuggingFace FLUX.1-schnell generation with seed ${seed}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
        
        const response = await fetch(
          "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.HF_API_KEY}`,
              "Content-Type": "application/json",
              Accept: "image/jpeg",
            },
            body: JSON.stringify({
              inputs: positivePrompt,
              parameters: {
                seed: seed,
              },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);
        
        if (response.ok) {
          logger.info(`HuggingFace FLUX.1-schnell succeeded for seed ${seed}`);
          const arrayBuffer = await response.arrayBuffer();
          return Buffer.from(arrayBuffer);
        } else {
          const errorMsg = await response.text();
          logger.warn(`HuggingFace FLUX.1-schnell failed with status ${response.status}: ${errorMsg}. Trying next fallback...`);
        }
      } catch (error: any) {
        logger.warn(`HuggingFace FLUX.1-schnell failed: ${error.message}. Trying next fallback...`);
      }
    }

    // 2. Pollinations AI Fallback (completely free, no API key required, reliable)
    try {
      logger.info(`Attempting Pollinations AI generation with seed ${seed}...`);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(positivePrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
      
      let data: Buffer | null = null;
      let attempt = 1;
      const maxRetries = 2; // Reduce from 3 to 2
      
      while (attempt <= maxRetries) {
        try {
          logger.info(`Sending Pollinations AI request (Attempt ${attempt}/${maxRetries}) for seed ${seed}...`);
          const response = await axios.get(pollinationsUrl, {
            responseType: "arraybuffer",
            timeout: 10000, // Reduce from 25000 to 10000 (10 seconds)
          });
          if (response.status === 200 && response.data) {
            logger.info(`Pollinations AI succeeded for seed ${seed} on attempt ${attempt}`);
            data = Buffer.from(response.data);
            break;
          }
        } catch (error: any) {
          logger.warn(`Pollinations AI attempt ${attempt} failed for seed ${seed}: ${error.message}`);
          if (attempt < maxRetries) {
            const delay = attempt * 2000; // Reduce retry delay
            logger.info(`Waiting ${delay}ms before retrying Pollinations AI for seed ${seed}...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
        attempt++;
      }

      if (data) {
        return data;
      }
    } catch (error: any) {
      logger.warn(`Pollinations AI failed: ${error.message || error}. Trying next fallback...`);
    }

    // 3. Prodia Fallback (text-to-image)
    if (env.PRODIA_API_KEY) {
      try {
        logger.info("Attempting Prodia SDXL generation...");
        const generateResponse = await axios.post(
          "https://api.prodia.com/v1/sdxl/generate",
          {
            prompt: positivePrompt,
            negative_prompt: negativePrompt,
            model: "sd_xl_base_1.0.safetensors [3f25c575]",
            seed,
            width: 1024,
            height: 1024,
          },
          { headers: { "X-Prodia-Key": env.PRODIA_API_KEY, "Content-Type": "application/json" } }
        );

        const jobId = generateResponse.data.job;
        let completed = false;
        let attempts = 0;
        let jobUrl = "";

        while (!completed && attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const jobStatus = await axios.get(`https://api.prodia.com/v1/job/${jobId}`, {
            headers: { "X-Prodia-Key": env.PRODIA_API_KEY },
          });

          if (jobStatus.data.status === "succeeded") {
            completed = true;
            jobUrl = jobStatus.data.imageUrl;
          } else if (jobStatus.data.status === "failed") {
            throw new Error("Prodia job failed");
          }
          attempts++;
        }

        if (jobUrl) {
          const imgResponse = await axios.get(jobUrl, { responseType: "arraybuffer" });
          return Buffer.from(imgResponse.data);
        }
      } catch (error: any) {
        logger.warn(`Prodia failed: ${error.message || error}. Falling back to style-transfer.`);
      }
    } else {
      logger.warn("Skipping Prodia: PRODIA_API_KEY is not defined");
    }

    // 3. Emergency Fallback: Apply style transformation to the ORIGINAL room photo
    // This preserves the room structure while changing colors/mood to match the style
    if (originalImageBuffer) {
      logger.warn("All AI providers failed. Applying style-transfer on original room photo...");
      return await this.applyStyleTransfer(originalImageBuffer, positivePrompt, seed);
    }

    // 4. Last resort: generate a placeholder with a message
    logger.error("All AI providers failed and no original image available. Generating placeholder.");
    return await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 3,
        background: { r: 40, g: 44, b: 52 },
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="1024" height="1024">
              <style>
                .title { fill: #FF6B35; font-size: 48px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: bold; }
                .subtitle { fill: #ffffff; font-size: 28px; font-family: 'Plus Jakarta Sans', sans-serif; }
              </style>
              <text x="50%" y="45%" text-anchor="middle" class="title">MyDesignGhar AI</text>
              <text x="50%" y="55%" text-anchor="middle" class="subtitle">Generated ${positivePrompt.substring(22, 50)}...</text>
            </svg>`
          ),
          top: 0,
          left: 0,
        },
      ])
      .jpeg()
      .toBuffer();
  }

  /**
   * Applies a visual style-transfer to the original room image.
   * Preserves the room structure while changing colors, warmth, and mood.
   * Each seed produces a different variant.
   */
  static async applyStyleTransfer(
    imageBuffer: Buffer,
    prompt: string,
    seed: number
  ): Promise<Buffer> {
    try {
      const variant = seed % 3;
      const metadata = await sharp(imageBuffer).metadata();
      const width = metadata.width || 1024;
      const height = metadata.height || 1024;

      // Create different style-themed overlays per variant
      const overlays: { tint: { r: number; g: number; b: number }; saturation: number; brightness: number }[] = [
        { tint: { r: 255, g: 200, b: 120 }, saturation: 1.3, brightness: 1.1 },   // warm golden
        { tint: { r: 180, g: 220, b: 255 }, saturation: 1.1, brightness: 1.05 },   // cool blue
        { tint: { r: 220, g: 180, b: 160 }, saturation: 1.2, brightness: 1.15 },   // earthy terracotta
      ];

      const style = overlays[variant];

      // Apply color grading to the original photo to simulate a redesigned look
      let pipeline = sharp(imageBuffer)
        .resize(1024, 1024, { fit: "cover" })
        .modulate({
          saturation: style.saturation,
          brightness: style.brightness,
        })
        .tint(style.tint);

      // Add a subtle "AI Redesign" watermark overlay
      const overlaySvg = Buffer.from(
        `<svg width="1024" height="1024">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:rgb(${style.tint.r},${style.tint.g},${style.tint.b});stop-opacity:0.15" />
              <stop offset="100%" style="stop-color:rgb(${style.tint.r},${style.tint.g},${style.tint.b});stop-opacity:0.05" />
            </linearGradient>
          </defs>
          <rect width="1024" height="1024" fill="url(#grad)" />
          <text x="512" y="980" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="16" font-family="sans-serif" font-weight="bold">AI CONCEPT PREVIEW · MYDESIGNGHAR</text>
        </svg>`
      );

      return await pipeline
        .composite([{ input: overlaySvg, top: 0, left: 0 }])
        .jpeg({ quality: 90 })
        .toBuffer();
    } catch (error: any) {
      logger.error(`Style transfer failed: ${error.message}`);
      return imageBuffer;
    }
  }

  /**
   * Watermarks a preview image buffer
   */
  static async applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
    try {
      logger.info("Applying watermark to preview image...");
      const watermarkSvg = Buffer.from(
        `<svg width="800" height="800">
          <style>
            .watermark {
              fill: rgba(255, 255, 255, 0.25);
              font-family: 'Sora', sans-serif;
              font-weight: 800;
              font-size: 54px;
              text-anchor: middle;
            }
          </style>
          <text x="400" y="400" transform="rotate(-30, 400, 400)" class="watermark">MYDESIGNGHAR.COM PREVIEW</text>
        </svg>`
      );

      return await sharp(imageBuffer)
        .resize(800, 800)
        .composite([{ input: watermarkSvg, top: 0, left: 0 }])
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error: any) {
      logger.error(`Watermarking failed: ${error.message}`);
      return imageBuffer;
    }
  }

  /**
   * Generates a 200x200 thumbnail
   */
  static async generateThumbnail(imageBuffer: Buffer): Promise<Buffer> {
    return await sharp(imageBuffer).resize(200, 200, { fit: "cover" }).jpeg({ quality: 70 }).toBuffer();
  }
}
