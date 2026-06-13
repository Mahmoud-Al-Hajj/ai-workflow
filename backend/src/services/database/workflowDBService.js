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
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      throw new Error("Invalid workflow ID");
    }
    return prisma.workflow.findUnique({ where: { id: numId } });
  }

  async getAllWorkflows() {
    return prisma.workflow.findMany({
      include: {
        user: true,
      },
    });
  }

  async getWorkflowsForUser(userId) {
    const numId = Number(userId);
    if (isNaN(numId) || numId <= 0) {
      throw new Error("Invalid user ID");
    }
    return prisma.workflow.findMany({
      where: { userId: numId },
    });
  }

  async deleteWorkflow(id) {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      throw new Error("Invalid workflow ID");
    }
    return prisma.workflow.delete({ where: { id: numId } });
  }

  async updateWorkflow(id, updateData, tx = null) {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      throw new Error("Invalid workflow ID");
    }
    const client = tx || prisma;
    return client.workflow.update({
      where: { id: numId },
      data: updateData,
    });
  }
}
