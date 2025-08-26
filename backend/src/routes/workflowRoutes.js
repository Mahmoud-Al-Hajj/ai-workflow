import express from "express";
import { WorkflowController } from "../controllers/WorkflowController.js";

const router = express.Router();

router.get("/workflows", WorkflowController.getAllWorkflows);
router.get("/workflows/user/:userID", WorkflowController.getWorkflowsForUser); // Move this up
router.get("/workflows/:id", WorkflowController.getWorkflowById); // Move this down
router.post("/workflows", WorkflowController.createCompleteWorkflow);
router.delete("/workflows/:id", WorkflowController.deleteWorkflow);

export default router;
