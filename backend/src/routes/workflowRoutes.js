import express from "express";
import { WorkflowController } from "../controllers/WorkflowController.js";
import {
  apiLimiter,
  workflowLimiter,
} from "../middleware/rateLimitMiddleware.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/authMiddleware.js";
import {
  validateCreateWorkflow,
  validateIdParam,
} from "../middleware/validationMiddleware.js";

const router = express.Router();
const workflowController = new WorkflowController();

router.get(
  "/workflows",
  workflowLimiter,
  adminMiddleware,
  authMiddleware,
  (req, res) => workflowController.getAllWorkflows(req, res)
);
router.get("/workflows/user/:userId", apiLimiter, authMiddleware, (req, res) =>
  workflowController.getWorkflowsForUser(req, res)
);
router.get(
  "/workflows/:id",
  apiLimiter,
  validateIdParam,
  authMiddleware,
  (req, res) => workflowController.getWorkflowById(req, res)
);
router.post(
  "/workflows",
  workflowLimiter,
  validateCreateWorkflow,
  authMiddleware,
  (req, res) => workflowController.createCompleteWorkflow(req, res)
);
router.delete(
  "/workflows/:id",
  adminMiddleware,
  validateIdParam,
  authMiddleware,
  (req, res) => workflowController.deleteWorkflow(req, res)
);

export default router;
