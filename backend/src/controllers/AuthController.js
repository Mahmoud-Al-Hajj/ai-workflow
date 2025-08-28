import { AuthService } from "../services/authService.js";

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const result = await this.authService.login(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async register(req, res) {
    const userData = req.body;
    try {
      const result = await this.authService.register(userData);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
