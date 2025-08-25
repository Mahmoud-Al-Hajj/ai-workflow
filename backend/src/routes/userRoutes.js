import express from "express";
import UserService from "../services/userService.js";

const router = express.Router();

router.get("/api/users", (req, res) => {
  const users = UserService.getAllUsers();
  res.json(users);
});

router.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const user = UserService.getUserById(userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).send("User not found");
  }
});

router.post("/api/users", (req, res) => {
  const newUser = req.body;
  const createdUser = UserService.createUser(newUser);
  res.status(201).json(createdUser);
});

router.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  const result = UserService.updateUser(userId, updatedUser);
  if (result) {
    res.json(result);
  } else {
    res.status(404).send("User not found");
  }
});

router.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  UserService.deleteUser(userId);
  res.status(200).send("User deleted");
});

export default router;
