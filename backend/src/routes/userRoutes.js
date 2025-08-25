import express from "express";
import { UserService } from "../services/database/userService.js";

const router = express.Router();

router.get("/api/users", async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/api/users/:id", async (req, res) => {
  const userId = req.params.id;
  const user = await UserService.getUserById(userId);
  if (user) {
    res.json({
      success: true,
      data: user,
    });
  } else {
    res.status(404).send("User not found");
  }
});

router.post("/api/users", async (req, res) => {
  const newUser = req.body;
  try {
    const createdUser = await UserService.createUser(newUser);
    res.status(201).json({
      success: true,
      data: createdUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/api/users/:id", async (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  try {
    const result = await UserService.updateUser(userId, updatedUser);
    if (result) {
      res.json({
        success: true,
        data: result,
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete("/api/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    await UserService.deleteUser(userId);
    res.status(200).send("User deleted");
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
export default router;
