import express from "express";
import dotenv from "dotenv";

// Import your routes
import userRoutes from "./routes/userRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/api", userRoutes);
app.use("/api", workflowRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "AI Workflow API is running!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
