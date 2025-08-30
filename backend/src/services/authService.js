import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

class AuthService {
  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    const token = generateToken(user.id);
    return { user, token };
  }
  async register({ name, email, password, n8nUrl, n8nApiKey }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        n8nUrl,
        n8nApiKey,
      },
    });

    const token = generateToken(user.id);
    return { user, token };
  }
}

export { AuthService };
