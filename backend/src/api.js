import express from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import logger from "./utils/logger.js";
// Import your routes
import userRoutes from "./routes/userRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
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

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  logger.info("Incoming request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    service: "API",
  });

  // Log response when it finishes
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info("Request completed", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      service: "API",
    });
  });

  next();
};

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(requestLogger); // Log all requests
app.use(limiter);

// Routes
app.use("/api", userRoutes);
app.use("/api", workflowRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: Date.now(),
    memory: process.memoryUsage(),
  });
});
//handling 404 (route not found).
app.use((req, res) => {
  logger.warn("Route not found", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    service: "API",
  });

  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// handling all other errors
app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    service: "API",
  });

  res.status(err.status || 500).json({
    error: err.name || "InternalServerError",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    service: "API",
  });
  console.log(`🚀 Server running on port ${PORT}`);
});
