import express from "express";
import { WorkflowController } from "../controllers/WorkflowController.js";
import {
  validateCreateWorkflow,
  validateIdParam,
} from "../middleware/validationMiddleware.js";

const router = express.Router();
const workflowController = new WorkflowController();

router.get("/workflows", (req, res) =>
  workflowController.getAllWorkflows(req, res)
);
router.get("/workflows/user/:userId", (req, res) =>
  workflowController.getWorkflowsForUser(req, res)
);
router.get("/workflows/:id", validateIdParam, (req, res) =>
  workflowController.getWorkflowById(req, res)
);
router.post("/workflows", validateCreateWorkflow, (req, res) =>
  workflowController.createCompleteWorkflow(req, res)
);
router.delete("/workflows/:id", validateIdParam, (req, res) =>
  workflowController.deleteWorkflow(req, res)
);

export default router;
