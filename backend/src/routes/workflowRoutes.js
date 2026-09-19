import express from "express";
import { WorkflowController } from "../controllers/WorkflowController.js";
import {
  apiLimiter,
  workflowLimiter,
} from "../middleware/rateLimitMiddleware.js";
import { authMiddleware, requireAdmin } from "../middleware/authMiddleware.js";
import {
  validateCreateWorkflow,
  validateIdParam,
} from "../middleware/validationMiddleware.js";

const router = express.Router();
const workflowController = new WorkflowController();

router.get("/workflows", workflowLimiter, requireAdmin, (req, res) =>
  workflowController.getAllWorkflows(req, res),
);
router.get("/workflows/user/:userId", apiLimiter, authMiddleware, (req, res) =>
  workflowController.getWorkflowsForUser(req, res),
);
// Order throughout: rate limit -> authenticate -> validate. Validating first
// would report malformed input to callers who are not signed in.
router.get(
  "/workflows/:id",
  apiLimiter,
  authMiddleware,
  validateIdParam,
  (req, res) => workflowController.getWorkflowById(req, res),
);
router.post(
  "/workflows",
  workflowLimiter,
  authMiddleware,
  validateCreateWorkflow,
  (req, res) => workflowController.createCompleteWorkflow(req, res),
);
router.delete("/workflows/:id", authMiddleware, validateIdParam, (req, res) =>
  workflowController.deleteWorkflow(req, res),
);

export default router;
