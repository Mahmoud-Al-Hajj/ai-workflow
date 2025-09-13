/**
 * NodeCreationService - Handles node instantiation, naming, and type mapping
 *
 * Responsibilities:
 * - Create n8n node objects with proper structure
 * - Ensure unique node names
 * - Map action strings to n8n node types
 * - Handle node parameters and positioning
 */
import { getTriggerType, getActionType } from "../catalogService.js";

export class NodeCreationService {
  constructor() {
    this.usedNodeNames = new Set(["Trigger"]);
    this.nodeId = 1;
  }

  /**
   * Reset state for new workflow
   */
  reset() {
    this.usedNodeNames = new Set(["Trigger"]);
    this.nodeId = 1;
  }

  /**
   * Create a complete n8n node object
   */
  createNode({ name, type, position, parameters }) {
    const node = {
      id: this.nodeId.toString(),
      name: name,
      type: type,
      typeVersion: this.getTypeVersion(type),
      position: position,
      parameters: parameters || {},
    };

    this.nodeId++;
    return node;
  }

  /**
   * Generate unique node name from base action name
   */
  ensureUniqueNodeName(baseName) {
    let uniqueName = baseName;
    let counter = 2;

    while (this.usedNodeNames.has(uniqueName)) {
      uniqueName = `${baseName}_${counter}`;
      counter++;
    }

    this.usedNodeNames.add(uniqueName);
    return uniqueName;
  }

  /**
   * Get n8n node type for trigger
   */
  getTriggerNodeType(trigger) {
    // Extract service name (everything before first dot)
    const serviceName = trigger.split(".")[0].toLowerCase();

    // Handle schedule triggers
    if (trigger.startsWith("schedule.")) {
      const cronTrigger = getTriggerType("cron");
      return cronTrigger || "n8n-nodes-base.cron";
    }

    // Try to get trigger type from enhanced catalog
    const triggerType = getTriggerType(serviceName);
    if (triggerType) {
      return triggerType;
    }

    // Try with "trigger" suffix
    const triggerWithSuffix = getTriggerType(serviceName + "trigger");
    if (triggerWithSuffix) {
      return triggerWithSuffix;
    }

    return "n8n-nodes-base.manualTrigger";
  }

  getActionNodeType(action) {
    // Extract service name (everything before first dot)
    const serviceName = action.split(".")[0].toLowerCase();

    // Handle IF nodes specially
    if (action.startsWith("if.")) {
      return "n8n-nodes-base.if";
    }

    // Handle HTTP request nodes
    if (action.startsWith("httprequest.")) {
      return "n8n-nodes-base.httpRequest";
    }

    // Handle wait/delay nodes
    if (action.startsWith("wait.") || action.startsWith("delay.")) {
      return "n8n-nodes-base.wait";
    }

    // Try to get action type from enhanced catalog
    const actionType = getActionType(serviceName);
    if (actionType) {
      return actionType;
    }

    // Fallback mapping for common services
    const fallbackMap = {
      postgres: "n8n-nodes-base.postgres",
      mysql: "n8n-nodes-base.mySql",
      mongodb: "n8n-nodes-base.mongoDb",
      salesforce: "n8n-nodes-base.salesforce",
      gmail: "n8n-nodes-base.gmail",
      mailchimp: "n8n-nodes-base.mailchimp",
      slack: "n8n-nodes-base.slack",
      airtable: "n8n-nodes-base.airtable",
      googlecalendar: "n8n-nodes-base.googleCalendar",
      sms77: "n8n-nodes-base.sms77",
    };

    return fallbackMap[serviceName] || "n8n-nodes-base.function";
  }

  /**
   * Get appropriate type version for node type
   */
  getTypeVersion(nodeType) {
    // Common type versions for different node types
    const typeVersionMap = {
      "n8n-nodes-base.if": 2.2,
      "n8n-nodes-base.httpRequest": 1,
      "n8n-nodes-base.wait": 1,
      "n8n-nodes-base.cron": 1,
      "n8n-nodes-base.manualTrigger": 1,
      "n8n-nodes-base.webhook": 1,
    };

    return typeVersionMap[nodeType] || 1;
  }

  /**
   * Create trigger node
   */
  createTriggerNode(trigger, triggerParams) {
    return this.createNode({
      name: "Trigger",
      type: this.getTriggerNodeType(trigger),
      position: [0, 0], // Trigger always at origin
      parameters: triggerParams || {},
    });
  }

  /**
   * Create action node with unique naming
   */
  createActionNode(actionObj, position) {
    const nodeType = this.getActionNodeType(actionObj.action);
    const uniqueNodeName = this.ensureUniqueNodeName(actionObj.action);

    // Special handling for function nodes
    if (
      nodeType === "n8n-nodes-base.function" &&
      actionObj.params &&
      actionObj.params.code
    ) {
      // Ensure function code is properly set and any special parameters are included
      return {
        node: this.createNode({
          name: uniqueNodeName,
          type: nodeType,
          position: position,
          parameters: {
            functionCode: actionObj.params.code, // n8n sometimes uses functionCode instead of code
            code: actionObj.params.code,
            jsCode: actionObj.params.code, // Another possible parameter name
            language: "javascript", // Explicitly set language
          },
        }),
        uniqueName: uniqueNodeName,
      };
    }

    return {
      node: this.createNode({
        name: uniqueNodeName,
        type: nodeType,
        position: position,
        parameters: actionObj.params || {},
      }),
      uniqueName: uniqueNodeName,
    };
  }
}
