// Import what you need
import { WorkflowService } from "../services/workflowService.js";

// Create the class
export class WorkflowController {
  constructor() {
    this.workflowService = new WorkflowService();
  }

  async createCompleteWorkflow(req, res) {
    const { description, userId, n8nUrl, n8nApiKey } = req.body;
    try {
      const result = await this.workflowService.createCompleteWorkflow({
        description,
        userId,
        n8nUrl,
        n8nApiKey,
      });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAllWorkflows(req, res) {
    try {
      const workflows = await this.workflowService.getAllWorkflows();
      res.json({
        success: true,
        data: workflows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkflowById(req, res) {
    const id = req.params.id;
    try {
      const workflow = await this.workflowService.getWorkflowById(id);
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: "Workflow not found",
        });
      }
      res.json({
        success: true,
        data: workflow,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkflowsForUser(req, res) {
    const userId = req.params.userId;
    try {
      const workflows = await this.workflowService.getWorkflowsForUser(userId);
      res.json({
        success: true,
        data: workflows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteWorkflow(req, res) {
    const id = req.params.id;
    try {
      const deleted = await this.workflowService.deleteWorkflow(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Workflow not found",
        });
      }
      res.json({
        success: true,
        message: "Workflow deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
export const workflowController = new WorkflowController();
