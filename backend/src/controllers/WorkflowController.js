import { workflowService } from "../services/workflowService.js";
import {
  resolveN8nCredentials,
  N8nCredentialsError,
} from "../services/auth/n8nCredentials.js";
import { canAccessWorkflow } from "../services/auth/accessPolicy.js";

export class WorkflowController {
  constructor() {
    this.workflowService = workflowService;
  }

  async createCompleteWorkflow(req, res) {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "Unauthenticated" });
    }

    const { description } = req.body;
    const userId = req.user?.id;

    let credentials;
    try {
      credentials = resolveN8nCredentials(req.user);
    } catch (error) {
      if (error instanceof N8nCredentialsError) {
        return res.status(error.reason === "missing" ? 400 : 500).json({
          success: false,
          error: error.message,
        });
      }
      throw error;
    }

    try {
      const result = await this.workflowService.createCompleteWorkflow({
        description,
        userId,
        n8nUrl: credentials.n8nUrl,
        n8nApiKey: credentials.n8nApiKey,
      });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Workflow creation error:", error);
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
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid workflow ID",
      });
    }
    try {
      const workflow = await this.workflowService.getWorkflowById(id);
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: "Workflow not found",
        });
      }

      if (!canAccessWorkflow(req.user, workflow)) {
        return res.status(403).json({
          success: false,
          error: "Forbidden: You can only view your own workflows",
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
    // return workflows for the authenticated user only
    const userId = req.user?.id;
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
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid workflow ID",
      });
    }
    try {
      const workflow = await this.workflowService.getWorkflowById(id);
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: "Workflow not found",
        });
      }

      if (!canAccessWorkflow(req.user, workflow)) {
        return res.status(403).json({
          success: false,
          error: "Forbidden: You can only delete your own workflows",
        });
      }

      await this.workflowService.deleteWorkflow(id);
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
