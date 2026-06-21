import axios from "axios";
import { logger } from "./logger";

// Cache translations in memory to prevent duplicate requests
const translationCache = new Map<string, string>();

/**
 * Translate a single text string using Google's free translation client
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || typeof text !== "string") return text;
  if (!targetLang || targetLang === "en" || targetLang === "undefined") return text;

  const cleanText = text.trim();
  if (!cleanText) return text;

  // Ignore numbers, email addresses, and very short symbols
  if (/^\d+$/.test(cleanText) || cleanText.includes("@") || cleanText.length <= 1) {
    return text;
  }

  const cacheKey = `${targetLang}:${cleanText}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const response = await axios.get(url, { timeout: 3000 });
    const translated = response.data?.[0]?.map((x: any) => x[0]).join("") || cleanText;
    
    translationCache.set(cacheKey, translated);
    return translated;
  } catch (error: any) {
    logger.error(`Dynamic translation failed for "${cleanText}" to "${targetLang}": ${error.message}`);
    // Fallback to original text on failure
    return text;
  }
}

// System keys that should never be translated or processed
const EXCLUDED_KEYS = new Set([
  "id", "userId", "email", "role", "status", "type",
  "avatarUrl", "previewUrl", "thumbnailUrl", "originalUrl", "beforeUrl", "downloadUrl",
  "createdAt", "updatedAt", "deletedAt", "referenceId",
  "razorpayOrderId", "razorpayPaymentId", "dailyRoomName", "dailyRoomUrl", "token", "url",
  "phone", "currency", "amount", "price", "rating", "reviews", "experience", "balance",
  "bonus", "code", "isRead", "isPhoneVerified", "isActive", "avatarSeed", "availabilityId"
]);

/**
 * Recursively walk an object/array and translate all string values of non-excluded keys
 */
export async function translateObject(obj: any, targetLang: string): Promise<any> {
  if (!targetLang || targetLang === "en" || targetLang === "undefined") return obj;
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return Promise.all(obj.map((item) => translateObject(item, targetLang)));
  }

  if (typeof obj === "object") {
    const translatedObj: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      
      if (EXCLUDED_KEYS.has(key)) {
        translatedObj[key] = val;
      } else if (typeof val === "string") {
        translatedObj[key] = await translateText(val, targetLang);
      } else if (typeof val === "object") {
        translatedObj[key] = await translateObject(val, targetLang);
      } else {
        translatedObj[key] = val;
      }
    }
    return translatedObj;
  }

  return obj;
}
