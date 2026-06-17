import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message || err}`, {
    stack: err.stack,
  });

  const statusCode = err.status || err.statusCode || 500;
  
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
