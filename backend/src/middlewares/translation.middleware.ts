import { Request, Response, NextFunction } from "express";
import { translateObject } from "../utils/translator";

/**
 * Express middleware that intercepts JSON responses and translates user-facing strings
 * if the user has selected a language other than English (en).
 */
export async function translationMiddleware(req: Request, res: Response, next: NextFunction) {
  const targetLang = req.headers["accept-language"] as string;

  if (targetLang && targetLang !== "en" && targetLang !== "undefined") {
    const originalJson = res.json;

    res.json = function (body: any): Response {
      // Restore the original json method to prevent infinite recursion
      res.json = originalJson;

      translateObject(body, targetLang)
        .then((translatedBody) => {
          originalJson.call(res, translatedBody);
        })
        .catch(() => {
          // Fallback to original body on error
          originalJson.call(res, body);
        });

      return res;
    };
  }

  next();
}
