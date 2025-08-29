import { getAllNodeTemplates } from "./catalogService.js";
import { getUserJsonFromEnglish } from "./aiService.js";
import { WorkflowDatabaseService } from "./database/workflowDBService.js";
import { deployWorkflow } from "./deploymentService.js";

export class WorkflowService {
  constructor() {
    this.nodeCatalog = getAllNodeTemplates();
    this.workflowDBService = new WorkflowDatabaseService();
  }

  async createCompleteWorkflow({ description, userId, n8nUrl, n8nApiKey }) {
    try {
      const aiWorkflowJson = await getUserJsonFromEnglish(description);

      // Deploy to n8n using AI JSON (deployWorkflow builds internally)
      const n8nWorkflowId = await deployWorkflow(
        aiWorkflowJson,
        n8nApiKey,
        n8nUrl
      );

      const n8nWorkflow = this.buildWorkflow(aiWorkflowJson);
      console.log(n8nWorkflow);
      // Step 4: Save to database
      const savedWorkflow = await this.workflowDBService.createWorkflow({
        name: description.substring(0, 50) + "...",
        data: n8nWorkflow,
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
      settings: {},
    };

    let nodeId = 1;
    let sequentialCount = 0;
    let parallelCount = 0;
    let prevNodeName = "Trigger";

    // Add trigger node
    workflow.nodes.push(
      this.createNode({
        id: nodeId,
        name: "Trigger",
        type: this.getTriggerNodeType(userJson.trigger),
        typeVersion: 1,
        position: [200, 300],
        parameters: userJson.triggerParams || {},
      })
    );

    nodeId++;

    for (const actionObj of userJson.actions) {
      const nodeType = this.getActionNodeType(actionObj.action);

      const nodePosition = this.getNodePosition(
        actionObj.mode,
        sequentialCount,
        parallelCount
      );

      workflow.nodes.push(
        this.createNode({
          id: nodeId,
          name: actionObj.action,
          type: nodeType,
          typeVersion: 1,
          position: nodePosition,
          parameters: actionObj.params || {},
        })
      );

      let fromNode;
      if (actionObj.mode === "sequential") {
        fromNode = prevNodeName;
      } else {
        fromNode = "Trigger";
      }

      this.addConnection(workflow, fromNode, actionObj.action);

      if (actionObj.mode === "sequential") {
        prevNodeName = actionObj.action;
        sequentialCount++;
      } else {
        parallelCount++;
      }

      nodeId++;
    }

    return workflow;
  }

  createNode({ id, name, type, position, parameters }) {
    return {
      id: `${id}`,
      name,
      type,
      typeVersion: 1,
      position,
      parameters,
    };
  }

  getNodePosition(mode, sequentialCount, parallelCount) {
    if (mode === "sequential") {
      return [400 + sequentialCount * 200, 200];
    } else {
      return [400, 50 + parallelCount * 370];
    }
  }

  addConnection(workflow, fromNode, toNode) {
    if (!workflow.connections[fromNode]) {
      workflow.connections[fromNode] = { main: [[]] };
    }
    workflow.connections[fromNode].main[0].push({
      node: toNode,
      type: "main",
      index: 0,
    });
  }

  // Dynamic trigger node type mapping using node catalog
  getTriggerNodeType(trigger) {
    // Extract service name (everything before first dot)
    const serviceName = trigger.split(".")[0].toLowerCase();
    if (trigger.startsWith("schedule.")) {
      return "n8n-nodes-base.scheduleTrigger"; // Use n8n Schedule Trigger node
    }
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
