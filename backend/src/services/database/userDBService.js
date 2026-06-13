import prisma from "../../lib/prisma.js";

export class UserDBService {
  async createUser({ name, email, password, n8nUrl, n8nApiKey }) {
    return prisma.user.create({
      data: {
        name,
        email,
        password,
        n8nUrl,
        n8nApiKey,
      },
    });
  }

  async getAllUsers() {
    // Only return essential user fields without exposing all workflows
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // Exclude workflows to prevent unnecessary data exposure
      },
    });
  }

  async getUserById(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      throw new Error("Invalid user ID");
    }
    return prisma.user.findUnique({
      where: { id: numId },
      include: {
        workflows: true,
      },
    });
  }

  async updateUser(id, updateData) {
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      throw new Error("Invalid user ID");
    }
    return prisma.user.update({
      where: { id: numId },
      data: updateData,
    });
  }

  async deleteUser(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      throw new Error("Invalid user ID");
    }
    return prisma.user.delete({
      where: { id: numId },
    });
  }

  async getUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }
}
