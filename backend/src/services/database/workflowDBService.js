import prisma from "../../lib/prisma.js";

export class WorkflowDatabaseService {
  // Simple database-only method
  async createWorkflow({ name, data, userId }, tx = null) {
    const client = tx || prisma;
    return client.workflow.create({
      data: {
        name,
        data,
        userId: Number(userId),
        status: "PENDING",
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
    return prisma.workflow.findMany({
      where: { userId: Number(userId) },
    });
  }
  async deleteWorkflow(id) {
    return prisma.workflow.delete({ where: { id: Number(id) } });
  }

  async updateWorkflow(id, updateData, tx = null) {
    const client = tx || prisma;
    return client.workflow.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }
}
