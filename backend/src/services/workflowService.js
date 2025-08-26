import { getAllNodeTemplates } from "./catalogService.js";
import { getUserJsonFromEnglish } from "./aiService.js";
import { WorkflowDatabaseService } from "./database/workflowDBService.js";
import { deployWorkflow } from "./deploymentService.js";

export class WorkflowService {
  constructor() {
    this.nodeCatalog = getAllNodeTemplates();
    this.workflowDBService = new WorkflowDatabaseService();
  }

  // Main business logic method - moved from workflowDBService
  async createCompleteWorkflow({ description, userId, n8nUrl, n8nApiKey }) {
    try {
      // Step 1: Generate AI workflow JSON from English
      const aiWorkflowJson = await getUserJsonFromEnglish(description);

      // Step 2: Deploy to n8n using AI JSON (deployWorkflow builds internally)
      const n8nWorkflowId = await deployWorkflow(
        aiWorkflowJson,
        n8nApiKey,
        n8nUrl
      );

      // Step 3: Build n8n workflow format for response
      const n8nWorkflow = this.buildWorkflow(aiWorkflowJson);

      // Step 4: Save to database
      const savedWorkflow = await this.workflowDBService.createWorkflow({
        name: description.substring(0, 50) + "...",
        data: aiWorkflowJson,
        userId,
      });

      return {
        databaseWorkflow: savedWorkflow,
        n8nWorkflowId,
        aiWorkflowJson,
        n8nWorkflow,
      };
    } catch (error) {
      throw new Error(`Failed to create complete workflow: ${error.message}`);
    }
  }

  buildWorkflow(userJson) {
    const workflow = {
      name: "AI Generated Workflow",
      nodes: [],
      connections: {},
    };
    //create a new workflow object and initialize it.
    let nodeId = 1;

    // Add trigger node
    workflow.nodes.push({
      id: `${nodeId}`,
      name: "Trigger",
      type: this.getTriggerNodeType(userJson.trigger),
      typeVersion: 1,
      position: [250, 300],
      parameters: {},
    });

    nodeId++;

    // Add all action nodes dynamically
    for (const actionObj of userJson.actions) {
      // Use dynamic node mapping for ALL services
      const nodeType = this.getActionNodeType(actionObj.action);

      const node = {
        id: `${nodeId}`,
        name: actionObj.action,
        type: nodeType,
        typeVersion: 1,
        position: [450, 300 + (nodeId - 2) * 200],
        parameters: actionObj.params || {},
      };

      workflow.nodes.push(node);

      // Connect trigger node to this action node using node names
      workflow.connections["Trigger"] = workflow.connections["Trigger"] || {
        main: [[]],
      };
      workflow.connections["Trigger"].main[0].push({
        node: actionObj.action,
        type: "main",
        index: 0,
      });

      nodeId++;
    }

    return workflow;
  }

  // Dynamic trigger node type mapping using node catalog
  getTriggerNodeType(trigger) {
    // Extract service name (everything before first dot)
    const serviceName = trigger.split(".")[0].toLowerCase();

    // Try to find trigger version first
    const triggerNodeName = serviceName + "trigger"; // e.g., "airtabletrigger"
    if (this.nodeCatalog[triggerNodeName]) {
      return this.nodeCatalog[triggerNodeName];
    }

    // Fallback to manual trigger
    return "n8n-nodes-base.manualTrigger";
  }

  // Dynamic action node type mapping using node catalog
  getActionNodeType(action) {
    // Extract service name (everything before first dot)
    const serviceName = action.split(".")[0].toLowerCase();

    // Use the dynamic node catalog directly
    return this.nodeCatalog[serviceName] || "n8n-nodes-base.set";
  }

  // Additional CRUD methods for database operations
  async getAllWorkflows() {
    return await this.workflowDBService.getAllWorkflows();
  }

  async getWorkflowById(id) {
    return await this.workflowDBService.getWorkflowById(id);
  }

  async getWorkflowsForUser(userId) {
    return await this.workflowDBService.getWorkflowsForUser(userId);
  }

  async deleteWorkflow(id) {
    return await this.workflowDBService.deleteWorkflow(id);
  }
}

export const workflowService = new WorkflowService();
