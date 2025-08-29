import express from "express";
import { WorkflowController } from "../controllers/WorkflowController.js";

const router = express.Router();
const workflowController = new WorkflowController();

router.get("/workflows", (req, res) =>
  workflowController.getAllWorkflows(req, res)
);
router.get("/workflows/user/:userId", (req, res) =>
  workflowController.getWorkflowsForUser(req, res)
);
router.get("/workflows/:id", (req, res) =>
  workflowController.getWorkflowById(req, res)
);
router.post("/workflows", (req, res) =>
  workflowController.createCompleteWorkflow(req, res)
);
router.delete("/workflows/:id", (req, res) =>
  workflowController.deleteWorkflow(req, res)
);

export default router;
