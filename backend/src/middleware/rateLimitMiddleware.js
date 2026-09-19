import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";

// Applied to every request as a blanket ceiling; the limiters below are the
// per-route ones and are stricter where it matters.
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // Limit each IP to 50 requests
  message: {
    status: 429,
    error: "Too many requests",
    message: "You have exceeded the rate limit. Try again later.",
  },
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      service: "RateLimit",
    });
    res.status(429).json({
      status: 429,
      error: "Too many requests",
      message: "You have exceeded the rate limit. Try again later.",
    });
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes for auth endpoints
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    error: "Too many login/registration attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const workflowLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // limit each IP to 30 workflow creations per hour
  message: {
    success: false,
    error: "Too many workflow creations, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
