import express from "express";
import { UserController } from "../controllers/UserController.js";
import {
  validateRegister,
  validateLogin,
} from "../middleware/validationMiddleware.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/authMiddleware.js";
import { apiLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();
const userController = new UserController();

router.get("/users", adminMiddleware, (req, res) =>
  userController.getAllUsers(req, res)
);
router.get("/users/:id", apiLimiter, authMiddleware, (req, res) =>
  userController.getUserById(req, res)
);
router.put("/users/:id", apiLimiter, authMiddleware, (req, res) =>
  userController.updateUser(req, res)
);

router.delete("/users/:id", adminMiddleware, (req, res) =>
  userController.deleteUser(req, res)
);

router.post("/auth/login", apiLimiter, validateLogin, (req, res) =>
  userController.login(req, res)
);
router.post("/auth/register", apiLimiter, validateRegister, (req, res) =>
  userController.register(req, res)
);

export default router;
