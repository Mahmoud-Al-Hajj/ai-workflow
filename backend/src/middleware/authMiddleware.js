import { AuthService } from "../services/auth/authService.js";
import logger from "../utils/logger.js";

const authService = new AuthService();

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const user = await authService.authenticate(token);
    if (!user) return res.status(401).json({ error: "Invalid token" });
    logger.debug("User authenticated successfully", {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip: req.ip,
      service: "AuthMiddleware",
    });

    req.user = user;
    next();
  } catch (err) {
    logger.error("User authentication failed", {
      error: err.message,
      stack: err.stack,
      service: "AuthMiddleware",
    });
    res.status(400).json({ error: "Invalid token" });
  }
}

export async function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

// adminMiddleware reads req.user, which authMiddleware sets, so the two must
// run in this order. Exported composed rather than separately, because listing
// them the wrong way round silently 401s every caller including admins.
export const requireAdmin = [authMiddleware, adminMiddleware];
