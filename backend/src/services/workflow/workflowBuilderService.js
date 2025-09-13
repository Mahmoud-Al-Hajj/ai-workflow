/**
 * WorkflowBuilderService - Orchestrates workflow building with clean separation of concerns
 *
 * Responsibilities:
 * - Coordinate between ConnectionService, NodeCreationService, and PositioningService
 * - Build complete n8n workflow structure
 * - Handle workflow-level settings and metadata
 */
import { ConnectionService } from "./connectionService.js";
import { NodeCreationService } from "./nodeCreationService.js";
import { positioningService } from "./positioningService.js";

export class WorkflowBuilderService {
  constructor() {
    this.connectionService = new ConnectionService();
    this.nodeCreationService = new NodeCreationService();
  }

  /**
   * Build complete n8n workflow from AI JSON
   */
  buildWorkflow(userJson) {
    // Reset all services for new workflow
    this.connectionService.reset();
    this.nodeCreationService.reset();

    // Initialize workflow structure
    const workflow = {
      name: "AI Generated Workflow",
      nodes: [],
      connections: {},
      settings: { saveExecutionProgress: true },
    };

    // Initialize positioning layout state
    const layoutState = positioningService.createLayoutState();

    // Step 1: Create trigger node
    const triggerNode = this.nodeCreationService.createTriggerNode(
      userJson.trigger,
      userJson.triggerParams
    );
    workflow.nodes.push(triggerNode);

    // Step 2: Process all action nodes
    for (const actionObj of userJson.actions) {
      this.processActionNode(actionObj, workflow, layoutState);
    }

    // Step 3: Set connections
    workflow.connections = this.connectionService.getConnections();

    // Step 4: Apply professional positioning
    positioningService.applyOptimizedDagreLayout(workflow);
    positioningService.validateAndFixOverlaps(workflow);

    return workflow;
  }

  /**
   * Process a single action node - create node and handle connections
   */
  processActionNode(actionObj, workflow, layoutState) {
    // Calculate intelligent position
    let nodePosition;
    if (actionObj.action.startsWith("if.")) {
      nodePosition = positioningService.handleIfNodePositioning(
        actionObj,
        layoutState
      );
    } else {
      nodePosition = positioningService.calculateNodePosition(
        actionObj.mode,
        layoutState
      );
    }

    // Create the node
    const { node, uniqueName } = this.nodeCreationService.createActionNode(
      actionObj,
      nodePosition
    );
    workflow.nodes.push(node);

    // Handle connections
    this.connectionService.connectNode(actionObj, uniqueName);
  }

  /**
   * Validate workflow structure
   */
  validateWorkflow(workflow) {
    const errors = [];

    // Check for orphaned nodes
    const connectedNodes = new Set(["Trigger"]);

    Object.values(workflow.connections).forEach((connections) => {
      connections.main?.forEach((outputConnections) => {
        outputConnections?.forEach((connection) => {
          connectedNodes.add(connection.node);
        });
      });
    });

    workflow.nodes.forEach((node) => {
      if (!connectedNodes.has(node.name) && node.name !== "Trigger") {
        errors.push(`Orphaned node detected: ${node.name}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get workflow statistics
   */
  getWorkflowStats(workflow) {
    return {
      nodeCount: workflow.nodes.length,
      connectionCount: Object.keys(workflow.connections).length,
      triggerType: workflow.nodes[0]?.type,
      hasConditionalNodes: workflow.nodes.some(
        (node) => node.type === "n8n-nodes-base.if"
      ),
    };
  }
}
