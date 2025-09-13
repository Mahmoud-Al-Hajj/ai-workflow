import { getUserJsonFromEnglish } from "./aiService.js";
import { WorkflowDatabaseService } from "./database/workflowDBService.js";
import { deployWorkflow } from "./workflow/deploymentService.js";
import { WorkflowBuilderService } from "./workflow/workflowBuilderService.js";
import { AIResponseValidator } from "../utils/AIResponseValidator.js";
import prisma from "../lib/prisma.js";

export class WorkflowService {
  constructor() {
    this.workflowDBService = new WorkflowDatabaseService();
    this.workflowBuilderService = new WorkflowBuilderService();
  }

  async createCompleteWorkflow({ description, userId, n8nUrl, n8nApiKey }) {
    return await prisma.$transaction(async (tx) => {
      let workflowId = null;
      let n8nWorkflowId = null;

      try {
        const aiWorkflowJson = await getUserJsonFromEnglish(description);

        const validation =
          AIResponseValidator.validateAIWorkflowResponse(aiWorkflowJson);
        if (!validation.isValid) {
          throw new Error(
            `AI response validation failed: ${validation.errors.join(", ")}`
          );
        }

        const n8nWorkflow =
          this.workflowBuilderService.buildWorkflow(aiWorkflowJson);
        console.log(JSON.stringify(n8nWorkflow, null, 2));

        const savedWorkflow = await this.workflowDBService.createWorkflow(
          {
            name: description.substring(0, 50) + "...",
            data: n8nWorkflow,
            userId: Number(userId), //la et2akad enu keef ma nb3tt rej3a integer
          },
          tx
        );
        workflowId = savedWorkflow.id;

        // Deploy to n8n using AI JSON (deployWorkflow builds internally)
        n8nWorkflowId = await deployWorkflow(aiWorkflowJson, n8nApiKey, n8nUrl);

        // Step 5: Update workflow with n8n ID and mark as ACTIVE
        await this.workflowDBService.updateWorkflow(
          workflowId,
          {
            n8nWorkflowId: n8nWorkflowId,
            status: "ACTIVE",
          },
          tx
        );
        return {
          databaseWorkflow: savedWorkflow,
          n8nWorkflowId,
          aiWorkflowJson,
          n8nWorkflow,
        };
      } catch (error) {
        throw new Error(`Failed to create complete workflow: ${error.message}`);
      }
    });
  }

  async getAllWorkflows() {
    return await this.workflowDBService.getAllWorkflows();
  }

  async getWorkflowById(id) {
    return await this.workflowDBService.getWorkflowById(id);
  }

  async getWorkflowsForUser(userId) {
    return await this.workflowDBService.getWorkflowsForUser(userId);
  }

  async deleteWorkflow(id) {
    return await this.workflowDBService.deleteWorkflow(id);
  }

  validateWorkflow(workflow) {
    return this.workflowBuilderService.validateWorkflow(workflow);
  }
  getWorkflowStats(workflow) {
    return this.workflowBuilderService.getWorkflowStats(workflow);
  }
}

export const workflowService = new WorkflowService();
