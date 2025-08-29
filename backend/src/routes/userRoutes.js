import express from "express";
import { UserController } from "../controllers/UserController.js";
import { AuthController } from "../controllers/AuthController.js";

const router = express.Router();
const userController = new UserController();
const authController = new AuthController();

router.get("/users", (req, res) => userController.getAllUsers(req, res));
router.get("/users/:id", (req, res) => userController.getUserById(req, res));
router.put("/users/:id", (req, res) => userController.updateUser(req, res));
router.delete("/users/:id", (req, res) => userController.deleteUser(req, res));

router.post("/auth/login", (req, res) => userController.login(req, res));
router.post("/auth/register", (req, res) => userController.register(req, res));

export default router;
