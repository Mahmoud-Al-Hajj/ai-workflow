import { AuthService } from "../services/authService.js";

export class AuthController {
  constructor() {
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
      const { username, email, password, n8nUrl, n8nApiKey } = req.body;
      const result = await this.authService.register({
        username,
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
}
