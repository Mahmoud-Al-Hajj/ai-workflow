import prisma from "../../lib/prisma.js";

export class WorkflowDatabaseService {
  // Simple database-only method
  async createWorkflow({ name, data, userId }) {
    return prisma.workflow.create({
      data: {
        name,
        data,
        userId,
      },
      include: {
        user: true,
      },
    });
  }

  async getWorkflowById(id) {
    return prisma.workflow.findUnique({ where: { id: parseInt(id) } });
  }

  async getAllWorkflows() {
    return prisma.workflow.findMany({
      include: {
        user: true,
      },
    });
  }
  async getWorkflowsForUser(userId) {
    return prisma.workflow.findMany({ where: { userId } });
  }
  async deleteWorkflow(id) {
    return prisma.workflow.delete({ where: { id } });
  }
}
