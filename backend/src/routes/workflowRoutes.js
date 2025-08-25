import express from "express";
import WorkflowService from "../services/workflowService.js";

const router = express.Router();

router.get("/api/workflows", (req, res) => {
  res.send("Get all workflows");
});
router.get("/api/workflows/:id", (req, res) => {
  const workflowId = req.params.id;
  res.send(`Get workflow with ID: ${workflowId}`);
});
router.get("/api/workflows/user/:userID", (req, res) => {
  const userID = req.params.userID;
  res.send(`Get workflows for user ID: ${userID}`);
});
router.post("/api/workflows", (req, res) => {
  const newWorkflow = req.body;
  res.status(201).json(newWorkflow);
});
