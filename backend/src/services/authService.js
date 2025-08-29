import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

const prisma = new PrismaClient();

class AuthService {
  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const token = generateToken(user.id);
    return { user, token };
  }
  async register({ username, email, password, n8nUrl, n8nApiKey }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        n8nUrl,
        n8nApiKey,
      },
    });

    const token = generateToken(user.id);
    return { user, token };
  }
}

export { AuthService };
