import express from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Import your routes
import userRoutes from "./routes/userRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests
  message: "request limit reached",
});

// Middleware
app.use(express.json());
app.use(limiter);

// Routes
app.use("/api", userRoutes);
app.use("/api", workflowRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "lak ezzzzzzzzzz" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
