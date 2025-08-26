import prisma from "../../lib/prisma.js";
import { getUserJsonFromEnglish } from "../aiService.js";
import { buildWorkflow } from "../WorkflowService.js";
import { deployWorkflow } from "../deploymentService.js";

export class WorkflowDatabaseService {
  // This method does EVERYTHING - AI + n8n + database
  async createCompleteWorkflow({ description, userId, n8nEmail, n8nPassword }) {
    try {
      // Step 1: Generate AI workflow JSON from English
      const aiWorkflowJson = await getUserJsonFromEnglish(description);

      // Step 2: Build n8n workflow format
      const n8nWorkflow = buildWorkflow(aiWorkflowJson);

      // Step 3: Deploy to n8n
      const n8nWorkflowId = await deployWorkflow(
        n8nWorkflow,
        n8nEmail,
        n8nPassword
      );

      // Step 4: Save to database
      const savedWorkflow = await prisma.workflow.create({
        data: {
          name: description.substring(0, 50) + "...", // Use description as name
          data: aiWorkflowJson, // Store the AI JSON
          userId,
        },
        include: {
          user: true,
        },
      });

      return {
        databaseWorkflow: savedWorkflow,
        n8nWorkflowId,
        aiWorkflowJson,
        n8nWorkflow,
      };
    } catch (error) {
      throw new Error(`Failed to create complete workflow: ${error.message}`);
    }
  }

  // Simple database-only method (for when you already have the data)
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
        user: true, // Include user info
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
