import { getAllNodeTemplates } from "./catalogService.js";
import { getUserJsonFromEnglish } from "./aiService.js";
import { WorkflowDatabaseService } from "./database/workflowDBService.js";
import { deployWorkflow } from "./deploymentService.js";
import dagre from "dagre";

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
      console.log(JSON.stringify(n8nWorkflow, null, 2));
      // Step 4: Save to database
      const savedWorkflow = await this.workflowDBService.createWorkflow({
        name: description.substring(0, 50) + "...",
        data: n8nWorkflow,
        userId: Number(userId), //la et2akad enu keef ma nb3tt rej3a integer
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
      settings: { saveExecutionProgress: true },
    };

    let nodeId = 1;
    let prevNodeName = "Trigger";

    // Add trigger node
    workflow.nodes.push(
      this.createNode({
        id: nodeId,
        name: "Trigger",
        type: this.getTriggerNodeType(userJson.trigger),
        position: [0, 0], // Initial position, will be updated by dagre
        parameters: userJson.triggerParams || {},
      })
    );
    nodeId++;

    let currentIfNode = null;
    for (const actionObj of userJson.actions) {
      const nodeType = this.getActionNodeType(actionObj.action);
      workflow.nodes.push(
        this.createNode({
          id: nodeId,
          name: actionObj.action,
          type: nodeType,
          position: [0, 0], // Initial position
          parameters: actionObj.params || {},
        })
      );

      let fromNode = null;
      if (actionObj.action.startsWith("if.")) {
        // Special handling for IF nodes on false branches
        if (actionObj.mode === "branch_false" && currentIfNode) {
          // Connect this IF to the previous IF's false output
          this.addConnection(workflow, currentIfNode, actionObj.action, 1, 0);
        } else if (actionObj.mode === "sequential") {
          fromNode = prevNodeName;
        } else if (actionObj.mode === "parallel") {
          fromNode = "Trigger";
        }
        currentIfNode = actionObj.action; // Set as current IF for subsequent branches
      } else if (actionObj.mode === "branch_true" && currentIfNode) {
        this.addConnection(workflow, currentIfNode, actionObj.action, 0, 0);
      } else if (actionObj.mode === "branch_false" && currentIfNode) {
        this.addConnection(workflow, currentIfNode, actionObj.action, 1, 0);
      } else if (actionObj.mode === "sequential") {
        fromNode = prevNodeName;
      } else if (actionObj.mode === "parallel") {
        fromNode = "Trigger";
      }

      if (fromNode) this.addConnection(workflow, fromNode, actionObj.action);

      if (actionObj.mode === "sequential") {
        prevNodeName = actionObj.action;
      }

      nodeId++;
    }

    // Use dagre for automatic layout
    this.applyDagreLayout(workflow);

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

  addConnection(workflow, fromNode, toNode, outputIndex = 0, inputIndex = 0) {
    if (!workflow.connections[fromNode]) {
      workflow.connections[fromNode] = { main: [[]] };
    }
    if (!workflow.connections[fromNode].main[outputIndex]) {
      workflow.connections[fromNode].main[outputIndex] = [];
    }
    workflow.connections[fromNode].main[outputIndex].push({
      node: toNode,
      type: "main",
      index: inputIndex,
    });
  }

  // Dynamic trigger node type mapping using node catalog
  getTriggerNodeType(trigger) {
    // Extract service name (everything before first dot)
    const serviceName = trigger.split(".")[0].toLowerCase();
    if (trigger.startsWith("schedule.")) {
      return "n8n-nodes-base.cron"; // Use n8n Schedule Trigger node
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

    if (action.startsWith("if.")) {
      return "n8n-nodes-base.if";
    }
    // if (action.startsWith("function.")) {
    //   return "n8n-nodes-base.function";
    // }
    // if (action.startsWith("merge.")) {
    //   return "n8n-nodes-base.merge";
    // }

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

  // Positioning methods
  applyDagreLayout(workflow) {
    const spacingX = 300;
    const spacingY = 200;

    // Build adjacency map
    const adjacency = {};
    Object.entries(workflow.connections).forEach(([fromNode, conn]) => {
      conn.main?.forEach((outputs) => {
        outputs.forEach((output) => {
          if (!adjacency[fromNode]) adjacency[fromNode] = [];
          adjacency[fromNode].push(output.node);
        });
      });
    });

    const positions = {};
    const visited = new Set();

    const placeNode = (node, depth, offsetY) => {
      if (visited.has(node)) return;
      visited.add(node);

      positions[node] = [depth * spacingX, offsetY];

      const children = adjacency[node] || [];
      if (children.length === 1) {
        placeNode(children[0], depth + 1, offsetY);
      } else if (children.length > 1) {
        // Spread branches vertically
        const branchStartY = offsetY - ((children.length - 1) * spacingY) / 2;
        children.forEach((child, i) =>
          placeNode(child, depth + 1, branchStartY + i * spacingY)
        );
      }
    };

    // Start layout from Trigger
    placeNode("Trigger", 0, 0);

    // Apply positions to workflow
    workflow.nodes.forEach((node) => {
      if (positions[node.name]) {
        node.position = positions[node.name];
      }
    });
  }
}

export const workflowService = new WorkflowService();
