import express from "express";
import { WorkflowDatabaseService } from "../services/database/workflowDatabaseService.js";

const router = express.Router();

router.get("/workflows", async (req, res) => {
  try {
    const workflows = await WorkflowDatabaseService.getAllWorkflows();
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
router.get("/workflows/:id", async (req, res) => {
  const workflowId = req.params.id;
  try {
    const workflow = await WorkflowDatabaseService.getWorkflowById(workflowId);
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
router.get("/workflows/user/:userID", async (req, res) => {
  const userID = req.params.userID;
  try {
    const userWorkflows = await WorkflowDatabaseService.getWorkflowsForUser(
      userID
    );
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
router.post("/workflows", async (req, res) => {
  const newWorkflow = req.body;
  try {
    const createdWorkflow =
      await WorkflowDatabaseService.createCompleteWorkflow(newWorkflow);
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
router.delete("/workflows/:id", async (req, res) => {
  const workflowId = req.params.id;
  try {
    await WorkflowDatabaseService.deleteWorkflow(workflowId);
    res.status(200).send("Workflow deleted");
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
