import { getUserJsonFromEnglish } from "./aiService.js";
import { WorkflowDatabaseService } from "./database/workflowDBService.js";
import { deployWorkflow } from "./workflow/deploymentService.js";
import { WorkflowBuilderService } from "./workflow/workflowBuilderService.js";
import { AIResponseValidator } from "../utils/AIResponseValidator.js";
import { logger } from "../utils/logger.js";
import prisma from "../lib/prisma.js";

export class WorkflowService {
  constructor() {
    this.workflowDBService = new WorkflowDatabaseService();
    this.workflowBuilderService = new WorkflowBuilderService();
  }

  async createCompleteWorkflow({ description, userId, n8nUrl, n8nApiKey }) {
    const startTime = Date.now();
    logger.info("Starting workflow creation", {
      userId,
      description,
      service: "WorkflowService",
    });

    return await prisma.$transaction(async (tx) => {
      let workflowId = null;
      let n8nWorkflowId = null;

      try {
        logger.debug("Generating AI workflow JSON", { userId });
        const aiWorkflowJson = await getUserJsonFromEnglish(description);

        logger.debug("Validating AI response", { userId });
        const validation =
          AIResponseValidator.validateAIWorkflowResponse(aiWorkflowJson);
        if (!validation.isValid) {
          throw new Error(
            `AI response validation failed: ${validation.errors.join(", ")}`
          );
        }

        logger.debug("Building n8n workflow", { userId });
        const n8nWorkflow =
          this.workflowBuilderService.buildWorkflow(aiWorkflowJson);
        console.log(JSON.stringify(n8nWorkflow, null, 2));

        logger.debug("Creating workflow in database", { userId });
        const savedWorkflow = await this.workflowDBService.createWorkflow(
          {
            name: description.substring(0, 50) + "...",
            data: n8nWorkflow,
            userId: Number(userId), //la et2akad enu keef ma nb3tt rej3a integer
          },
          tx
        );
        workflowId = savedWorkflow.id;
        logger.info("Workflow created in database", { userId, workflowId });

        logger.debug("Deploying workflow to n8n", { userId, workflowId });
        // Deploy to n8n using AI JSON (deployWorkflow builds internally)
        n8nWorkflowId = await deployWorkflow(aiWorkflowJson, n8nApiKey, n8nUrl);

        logger.info("Workflow deployed to n8n", {
          userId,
          workflowId,
          n8nWorkflowId,
        });
        // Step 5: Update workflow with n8n ID and mark as ACTIVE
        await this.workflowDBService.updateWorkflow(
          workflowId,
          {
            n8nWorkflowId: n8nWorkflowId,
            status: "ACTIVE",
          },
          tx
        );
        const duration = Date.now() - startTime;
        logger.info("Workflow creation completed successfully", {
          userId,
          workflowId,
          n8nWorkflowId,
          duration,
          service: "WorkflowService",
        });
        return {
          databaseWorkflow: savedWorkflow,
          n8nWorkflowId,
          aiWorkflowJson,
          n8nWorkflow,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error("Workflow creation failed", {
          userId,
          workflowId,
          n8nWorkflowId,
          error: error.message,
          stack: error.stack,
          duration,
          service: "WorkflowService",
        });
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
