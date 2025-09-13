import { getUserJsonFromEnglish } from "./aiService.js";
import { WorkflowDatabaseService } from "./database/workflowDBService.js";
import { deployWorkflow } from "./workflow/deploymentService.js";
import { WorkflowBuilderService } from "./workflow/workflowBuilderService.js";

export class WorkflowService {
  constructor() {
    this.workflowDBService = new WorkflowDatabaseService();
    this.workflowBuilderService = new WorkflowBuilderService();
  }

  async createCompleteWorkflow({ description, userId, n8nUrl, n8nApiKey }) {
    try {
      const aiWorkflowJson = await getUserJsonFromEnglish(description);

      // Deploy to n8n using AI JSON (deployWorkflow builds internally)
      const n8nWorkflowId = await deployWorkflow(
        aiWorkflowJson,
        n8nApiKey,
        n8nUrl
      );

      const n8nWorkflow =
        this.workflowBuilderService.buildWorkflow(aiWorkflowJson);
      console.log(JSON.stringify(n8nWorkflow, null, 2));
      // Step 4: Save to database
      const savedWorkflow = await this.workflowDBService.createWorkflow({
        name: description.substring(0, 50) + "...",
        data: n8nWorkflow,
        userId: Number(userId), //la et2akad enu keef ma nb3tt rej3a integer
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

  /**
   * Get all workflows
   */
  async getAllWorkflows() {
    return await this.workflowDBService.getAllWorkflows();
  }

  /**
   * Get workflow by ID
   */
  async getWorkflowById(id) {
    return await this.workflowDBService.getWorkflowById(id);
  }

  /**
   * Get workflows for specific user
   */
  async getWorkflowsForUser(userId) {
    return await this.workflowDBService.getWorkflowsForUser(userId);
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id) {
    return await this.workflowDBService.deleteWorkflow(id);
  }

  /**
   * Validate workflow structure
   */
  validateWorkflow(workflow) {
    return this.workflowBuilderService.validateWorkflow(workflow);
  }

  /**
   * Get workflow statistics
   */
  getWorkflowStats(workflow) {
    return this.workflowBuilderService.getWorkflowStats(workflow);
  }
}

export const workflowService = new WorkflowService();
