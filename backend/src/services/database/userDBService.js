import prisma from "../../lib/prisma.js";

export class UserService {
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
    return prisma.user.findMany({
      include: {
        workflows: true, // Include user's workflows
      },
    });
  }

  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        workflows: true,
      },
    });
  }

  async updateUser(id, updateData) {
    return prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  async deleteUser(id) {
    return prisma.user.delete({
      where: { id: parseInt(id) },
    });
  }

  async getUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }
}
