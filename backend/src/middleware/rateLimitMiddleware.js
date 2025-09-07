import rateLimit from "express-rate-limit";

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
