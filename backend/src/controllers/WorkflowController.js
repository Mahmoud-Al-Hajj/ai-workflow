// Import what you need
import { WorkflowService } from "../services/database/workflowDatabaseService.js";

// Create the class
export class WorkflowController {
  async createCompleteWorkflow(req, res) {
    const workflowData = req.body;
    try {
      const newWorkflow = await WorkflowService.createWorkflow(workflowData);
      res.status(201).json({
        success: true,
        data: newWorkflow,
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
      const workflows = await WorkflowService.getAllWorkflows();
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
      const workflow = await WorkflowService.getWorkflowById(id);
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
      const workflows = await WorkflowService.getWorkflowsForUser(userId);
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
      const deleted = await WorkflowService.deleteWorkflow(id);
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
