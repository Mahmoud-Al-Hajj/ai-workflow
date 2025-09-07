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

    let decryptedN8nKey = null;
    if (n8nApiKey) {
      decryptedN8nKey = decrypt(n8nApiKey);
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
