import { getUserJsonFromEnglish } from "./aiService.js";
import { WorkflowDatabaseService } from "./database/workflowDBService.js";
import { deployWorkflow } from "./workflow/deploymentService.js";
import { WorkflowBuilderService } from "./workflow/workflowBuilderService.js";
import { AIResponseValidator } from "../utils/AIResponseValidator.js";
import logger from "../utils/logger.js";
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

    return await prisma.$transaction(
      async (tx) => {
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

          // 1. Create workflow in DB (PENDING) inside a transaction
          const savedWorkflow = await prisma.$transaction(
            async (tx) => {
              return await this.workflowDBService.createWorkflow(
                {
                  name: description.substring(0, 50) + "...",
                  data: n8nWorkflow,
                  userId: Number(userId), //la et2akad enu keef ma nb3tt rej3a integer
                },
                tx
              );
            },
            { timeout: 30000 }
          );
          workflowId = savedWorkflow.id;
          logger.info("Workflow created in database", { userId, workflowId });

          // 2. Deploy to n8n (external call, outside transaction)
          logger.debug("Deploying workflow to n8n", { userId, workflowId });
          n8nWorkflowId = await deployWorkflow(
            aiWorkflowJson,
            n8nApiKey,
            n8nUrl
          );

          logger.info("Workflow deployed to n8n", {
            userId,
            workflowId,
            n8nWorkflowId,
          });
          // 3. Update workflow in DB with n8n ID and status ACTIVE (new transaction)
          await prisma.$transaction(
            async (tx) => {
              await this.workflowDBService.updateWorkflow(
                workflowId,
                {
                  n8nWorkflowId: n8nWorkflowId,
                  status: "ACTIVE",
                },
                tx
              );
            },
            { timeout: 30000 }
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
          throw new Error(
            `Failed to create complete workflow: ${error.message}`
          );
        }
      },
      { timeout: 30000 }
    );
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
