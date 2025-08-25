import express from "express";
import { WorkflowService } from "../services/database/workflowService.js";

const router = express.Router();

router.get("/api/workflows", async (req, res) => {
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
});
router.get("/api/workflows/:id", async (req, res) => {
  const workflowId = req.params.id;
  try {
    const workflow = await WorkflowService.getWorkflowById(workflowId);
    if (workflow) {
      res.json({
        success: true,
        data: workflow,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
router.get("/api/workflows/user/:userID", async (req, res) => {
  const userID = req.params.userID;
  try {
    const userWorkflows = await WorkflowService.getWorkflowsForUser(userID);
    res.json({
      success: true,
      data: userWorkflows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
router.post("/api/workflows", async (req, res) => {
  const newWorkflow = req.body;
  try {
    const createdWorkflow = await WorkflowService.createCompleteWorkflow(
      newWorkflow
    );
    res.status(201).json({
      success: true,
      data: createdWorkflow,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
router.delete("/api/workflows/:id", async (req, res) => {
  const workflowId = req.params.id;
  try {
    await WorkflowService.deleteWorkflow(workflowId);
    res.status(200).send("Workflow deleted");
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
