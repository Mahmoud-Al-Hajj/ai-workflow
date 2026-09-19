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

  // Workflows are opt-in: authentication looks a user up on every request and
  // has no use for them, so loading them by default would fetch a user's whole
  // workflow list on each call.
  async getUserById(id, { withWorkflows = false } = {}) {
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      throw new Error("Invalid user ID");
    }
    return prisma.user.findUnique({
      where: { id: numId },
      include: {
        workflows: withWorkflows,
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
