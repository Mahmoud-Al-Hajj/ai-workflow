import express from "express";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();
const authController = new AuthController();

router.post("/auth/login", (req, res) => authController.login(req, res));
router.post("/auth/register", (req, res) => authController.register(req, res));
