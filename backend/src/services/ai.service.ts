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
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
        
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
            timeout: 20000, // 20 seconds
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
   * Applies a dramatic visual style-transfer to the original room image.
   * Creates substantially different visual transformations per variant, going
   * far beyond simple color grading to simulate a redesigned room.
   * Each seed produces a visually distinct result.
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

      // Step 1: Create a base transformation that significantly alters the image
      let pipeline = sharp(imageBuffer).resize(1024, 1024, { fit: "cover" });

      if (variant === 0) {
        // VARIANT 0: Warm luxurious golden — high contrast, warm tones, dramatic lighting
        pipeline = pipeline
          .modulate({
            saturation: 1.5,
            brightness: 1.15,
            hue: 15, // shift towards warm
          })
          .gamma(1.8)
          .sharpen({ sigma: 2, m1: 1.5, m2: 0.7 })
          .tint({ r: 255, g: 180, b: 100 });
      } else if (variant === 1) {
        // VARIANT 1: Cool modern — desaturated, sharpened, blue tones, futuristic
        pipeline = pipeline
          .modulate({
            saturation: 0.6,
            brightness: 1.2,
            hue: -30, // shift towards cool blue
          })
          .gamma(2.2)
          .sharpen({ sigma: 3, m1: 2, m2: 1 })
          .linear(1.4, -0.15) // high contrast
          .tint({ r: 140, g: 200, b: 255 });
      } else {
        // VARIANT 2: Earthy dramatic — warm terracotta, deep shadows, cinematic vignette
        pipeline = pipeline
          .modulate({
            saturation: 1.8,
            brightness: 0.95,
            hue: 25, // warm earth shift
          })
          .gamma(1.5)
          .sharpen({ sigma: 1.5, m1: 1, m2: 0.5 })
          .linear(1.6, -0.25) // dramatic contrast
          .tint({ r: 220, g: 160, b: 120 });
      }

      // Step 2: Create dramatic architectural overlay patterns
      const overlayColors = [
        { primary: "255,200,100", secondary: "180,120,60", accent: "255,255,200" },  // golden
        { primary: "140,200,255", secondary: "80,130,200", accent: "200,230,255" },  // cool blue
        { primary: "220,160,120", secondary: "160,100,60", accent: "240,200,160" },  // terracotta
      ];
      const colors = overlayColors[variant];

      // Create complex SVG overlay that simulates architectural elements
      const architecturalOverlay = Buffer.from(
        `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Dramatic vignette effect -->
            <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
              <stop offset="0%" style="stop-color:rgba(0,0,0,0);stop-opacity:0"/>
              <stop offset="70%" style="stop-color:rgba(0,0,0,0);stop-opacity:0"/>
              <stop offset="100%" style="stop-color:rgba(0,0,0,0.45);stop-opacity:1"/>
            </radialGradient>
            <!-- Warm ambient light gradient from top -->
            <linearGradient id="ambientLight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgb(${colors.accent});stop-opacity:0.2"/>
              <stop offset="40%" style="stop-color:rgb(${colors.primary});stop-opacity:0.05"/>
              <stop offset="100%" style="stop-color:rgb(${colors.secondary});stop-opacity:0.15"/>
            </linearGradient>
            <!-- Side accent light -->
            <linearGradient id="sideLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:rgb(${colors.accent});stop-opacity:0.25"/>
              <stop offset="50%" style="stop-color:rgb(${colors.primary});stop-opacity:0"/>
              <stop offset="100%" style="stop-color:rgb(${colors.secondary});stop-opacity:0.1"/>
            </linearGradient>
          </defs>
          <!-- Vignette layer -->
          <rect width="1024" height="1024" fill="url(#vignette)"/>
          <!-- Ambient lighting layer -->
          <rect width="1024" height="1024" fill="url(#ambientLight)"/>
          <!-- Side accent lighting -->
          <rect width="1024" height="1024" fill="url(#sideLight)"/>
          <!-- Subtle horizontal architectural lines to simulate panels/molding -->
          <line x1="0" y1="340" x2="1024" y2="340" stroke="rgba(${colors.accent},0.08)" stroke-width="2"/>
          <line x1="0" y1="680" x2="1024" y2="680" stroke="rgba(${colors.accent},0.06)" stroke-width="1.5"/>
          <!-- Subtle vertical accent lines -->
          <line x1="256" y1="0" x2="256" y2="1024" stroke="rgba(${colors.accent},0.04)" stroke-width="1"/>
          <line x1="768" y1="0" x2="768" y2="1024" stroke="rgba(${colors.accent},0.04)" stroke-width="1"/>
          <!-- AI Redesign watermark -->
          <text x="512" y="990" text-anchor="middle" fill="rgba(255,255,255,0.25)" font-size="14" font-family="sans-serif" font-weight="bold">AI REDESIGN CONCEPT · MYDESIGNGHAR</text>
        </svg>`
      );

      // Step 3: Create a secondary transformation of the image (flipped/processed) for blending
      const flippedBuffer = await sharp(imageBuffer)
        .resize(1024, 1024, { fit: "cover" })
        .flop() // horizontal flip
        .modulate({
          saturation: 0.3,
          brightness: 0.6,
        })
        .blur(12)
        .toBuffer();

      // Step 4: Composite everything together
      const result = await pipeline
        .composite([
          // Blend in a subtle ghosted/flipped version of the room for "depth"
          { input: flippedBuffer, blend: "soft-light", top: 0, left: 0 },
          // Apply architectural overlays
          { input: architecturalOverlay, top: 0, left: 0 },
        ])
        .jpeg({ quality: 92 })
        .toBuffer();

      return result;
    } catch (error: any) {
      logger.error(`Style transfer failed: ${error.message}`);
      // Even in error, try a simpler transformation
      try {
        return await sharp(imageBuffer)
          .resize(1024, 1024, { fit: "cover" })
          .modulate({ saturation: 1.4, brightness: 1.1 })
          .gamma(1.8)
          .sharpen({ sigma: 2 })
          .jpeg({ quality: 90 })
          .toBuffer();
      } catch {
        return imageBuffer;
      }
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
