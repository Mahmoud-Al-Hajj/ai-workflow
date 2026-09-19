import { WorkflowDatabaseService } from "./database/workflowDBService.js";
import { startGenerationRun } from "./workflow/generationRun.js";
import logger from "../utils/logger.js";

export class WorkflowService {
  constructor() {
    this.workflowDBService = new WorkflowDatabaseService();
  }

  /**
   * Accept a Description and return immediately with a PENDING Workflow. The
   * Generation Run does the rest in the background (see ADR-0003).
   */
  async createCompleteWorkflow({ description, userId, n8nUrl, n8nApiKey }) {
    // Re-checked here as a domain invariant, not for HTTP shape: the middleware
    // only guards one route, this guards every caller.
    if (!userId || !description || !n8nUrl || !n8nApiKey) {
      throw new Error(
        "Missing required fields: userId, description, n8nUrl, n8nApiKey",
      );
    }

    if (typeof description !== "string" || description.length < 10) {
      throw new Error("Description must be at least 10 characters");
    }

    const startTime = Date.now();
    logger.info("Starting workflow creation (background processing)", {
      userId,
      description,
      service: "WorkflowService",
    });

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

    // Deliberately not awaited: the Generation Run owns every Status
    // transition from here, and reports failure as FAILED rather than by
    // throwing at a caller that has already had its response.
    startGenerationRun({
      workflowId: savedWorkflow.id,
      description,
      userId,
      n8nUrl,
      n8nApiKey,
    });

    logger.info("Workflow creation initiated (background processing started)", {
      userId,
      workflowId: savedWorkflow.id,
      duration: Date.now() - startTime,
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
}

export const workflowService = new WorkflowService();
