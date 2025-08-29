// Import what you need
import { WorkflowDatabaseService } from "../services/database/workflowDBService.js";
import { WorkflowService } from "../services/workflowService.js";

// Create the class
export class WorkflowController {
  constructor() {
    this.workflowService = new WorkflowDatabaseService();
  }

  async createCompleteWorkflow(req, res) {
    const { name, data, userId } = req.body;
    try {
      const result = await this.workflowService.createCompleteWorkflow({
        name,
        data,
        userId,
      });
      res.status(201).json({
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
