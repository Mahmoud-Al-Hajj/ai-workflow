import bcrypt from "bcrypt";
import { UserDBService } from "../database/userDBService.js";
import { generateToken, verifyToken } from "../../utils/jwt.js";
import { encrypt } from "../../utils/crypto.js";

class AuthService {
  constructor() {
    this.userDBService = new UserDBService();
  }

  /**
   * Resolve a bearer token to the User it identifies, or null if there is no
   * such user. Throws if the token itself is invalid or expired.
   */
  async authenticate(token) {
    const { userId } = verifyToken(token);
    return this.userDBService.getUserById(userId);
  }

  async login(email, password) {
    const user = await this.userDBService.getUserByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    const token = generateToken(user.id);
    return { user, token };
  }

  async register({ name, email, password, n8nUrl, n8nApiKey }) {
    // Validate n8n credentials before creating user
    if (!n8nUrl || !n8nApiKey) {
      throw new Error("n8n URL and API key are required");
    }

    // A unique email is a domain invariant, so it is enforced here rather than
    // in HTTP validation, where it would only hold for one route.
    const existing = await this.userDBService.getUserByEmail(email);
    if (existing) {
      throw new Error("A user already exists with this e-mail address");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let encryptedKey = null;
    if (n8nApiKey) {
      encryptedKey = encrypt(n8nApiKey);
    }

    const user = await this.userDBService.createUser({
      name,
      email,
      password: hashedPassword,
      n8nUrl,
      n8nApiKey: encryptedKey,
    });

    const token = generateToken(user.id);
    return { user, token };
  }
}

export { AuthService };
