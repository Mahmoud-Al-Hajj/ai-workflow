import { UserService } from "../services/database/userService.js";

export class UserController {
  async createUser(req, res) {
    const newUser = req.body;
    try {
      const user = await UserService.createUser(newUser);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getUserById(req, res) {
    const id = req.params.id;
    try {
      const user = await UserService.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateUser(req, res) {
    const id = req.params.id;
    const updatedData = req.body;
    try {
      const user = await UserService.updateUser(id, updatedData);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteUser(req, res) {
    const id = req.params.id;
    try {
      const user = await UserService.deleteUser(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
export const userController = new UserController();
