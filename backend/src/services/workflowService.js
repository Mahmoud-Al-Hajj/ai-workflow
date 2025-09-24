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
    logger.info("Starting workflow creation (background processing)", {
      userId,
      description,
      service: "WorkflowService",
    });

    // Step 1: Create PENDING workflow record
    const savedWorkflow = await this.workflowDBService.createWorkflow({
      name: description.substring(0, 50) + "...",
      data: null,
      userId: Number(userId),
      status: "PENDING",
    });

    logger.info("Workflow created in database (PENDING)", {
      userId,
      workflowId: savedWorkflow.id,
    });

    // Step 2: Start background
    setImmediate(async () => {
      const bgStartTime = Date.now();
      let aiWorkflowJson = null;
      let n8nWorkflowId = null;

      try {
        logger.info("Background: Generating AI workflow JSON", {
          userId,
          workflowId: savedWorkflow.id,
        });
        const aiStart = Date.now();
        aiWorkflowJson = await getUserJsonFromEnglish(description);
        const aiDuration = Date.now() - aiStart;

        logger.info("AI workflow JSON generated", {
          userId,
          workflowId: savedWorkflow.id,
          aiDuration,
        });

        // Validation
        const validation =
          AIResponseValidator.validateAIWorkflowResponse(aiWorkflowJson);
        if (!validation.isValid) {
          throw new Error(
            `AI response validation failed: ${validation.errors.join(", ")}`
          );
        }

        // Build n8n workflow
        const n8nWorkflow =
          this.workflowBuilderService.buildWorkflow(aiWorkflowJson);

        // Update with generated workflow data
        await this.workflowDBService.updateWorkflow(savedWorkflow.id, {
          data: n8nWorkflow,
        });

        // Deploy to n8n (~5 seconds)
        logger.info("Background: Deploying to n8n", {
          userId,
          workflowId: savedWorkflow.id,
        });
        const deployStart = Date.now();
        n8nWorkflowId = await deployWorkflow(aiWorkflowJson, n8nApiKey, n8nUrl);
        const deployDuration = Date.now() - deployStart;

        logger.info("Workflow deployed to n8n", {
          userId,
          workflowId: savedWorkflow.id,
          n8nWorkflowId,
          deployDuration,
        });

        // Mark as ACTIVE
        await this.workflowDBService.updateWorkflow(savedWorkflow.id, {
          n8nWorkflowId,
          status: "ACTIVE",
        });

        const totalDuration = Date.now() - bgStartTime;
        logger.info("Background workflow processing completed", {
          userId,
          workflowId: savedWorkflow.id,
          n8nWorkflowId,
          totalDuration,
          aiDuration,
          deployDuration,
        });
      } catch (error) {
        logger.error("Background workflow processing failed", {
          userId,
          workflowId: savedWorkflow.id,
          error: error.message,
          stack: error.stack,
          duration: Date.now() - bgStartTime,
        });

        // Mark as FAILED
        try {
          await this.workflowDBService.updateWorkflow(savedWorkflow.id, {
            status: "FAILED",
            error: error.message,
          });
        } catch (updateError) {
          logger.error("Failed to update workflow status to FAILED", {
            workflowId: savedWorkflow.id,
            error: updateError.message,
          });
        }
      }
    });

    // Step 3: Return immediately with PENDING workflow
    const duration = Date.now() - startTime;
    logger.info("Workflow creation initiated (background processing started)", {
      userId,
      workflowId: savedWorkflow.id,
      duration,
    });

    return {
      databaseWorkflow: savedWorkflow,
      status: "PENDING",
      message: "Workflow creation started. Processing in background.",
    };
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
