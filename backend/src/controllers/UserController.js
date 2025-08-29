import { UserService } from "../services/UserService.js";
import { AuthService } from "../services/authService.js";

export class UserController {
  constructor() {
    this.userService = new UserService();
    this.authService = new AuthService();
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async register(req, res) {
    try {
      const { name, email, password, n8nUrl, n8nApiKey } = req.body;
      const result = await this.authService.register({
        name,
        email,
        password,
        n8nUrl,
        n8nApiKey,
      });
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await this.userService.getAllUsers();
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
      const user = await this.userService.getUserById(id);
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
      const user = await this.userService.updateUser(id, updatedData);
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
      const user = await this.userService.deleteUser(id);
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
