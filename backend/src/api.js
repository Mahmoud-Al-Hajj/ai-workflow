import express from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
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
});

// Middleware
app.use(express.json());
app.use(cors());
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
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// handling all other errors
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  res.status(err.status || 500).json({
    error: err.name || "InternalServerError",
    message: err.message || "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
