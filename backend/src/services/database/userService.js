import prisma from "../lib/prisma.js";

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
  async getUserById(id) {
    return prisma.user.findUnique({ where: { id } });
  }
  async getWorkflowsForUser(userId) {
    return prisma.workflow.findMany({ where: { userId } });
  }
  async deleteUser(id, data) {
    return prisma.user.delete({ where: { id }, data });
  }
}
