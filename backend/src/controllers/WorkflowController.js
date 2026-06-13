import { workflowService } from "../services/workflowService.js";
import { decrypt } from "../utils/crypto.js";

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
    const n8nUrl = req.user?.n8nUrl;
    const n8nApiKey = req.user?.n8nApiKey;

    // Validate n8n configuration before proceeding
    if (!n8nUrl || !n8nApiKey) {
      return res.status(400).json({
        success: false,
        error: "n8n credentials not configured. Please update your profile with valid n8n credentials.",
      });
    }

    let decryptedN8nKey = null;
    try {
      decryptedN8nKey = decrypt(n8nApiKey);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Failed to decrypt n8n credentials. Please reconfigure your profile.",
      });
    }

    try {
      const result = await this.workflowService.createCompleteWorkflow({
        description,
        userId,
        n8nUrl,
        n8nApiKey: decryptedN8nKey,
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

      // Authorization check: users can only view their own workflows, admins can view any
      if (workflow.userId !== req.user.id && req.user.role !== "admin") {
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

      // Authorization check: users can delete their own workflows, admins can delete any
      if (workflow.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Forbidden: You can only delete your own workflows",
        });
      }

      const deleted = await this.workflowService.deleteWorkflow(id);
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
