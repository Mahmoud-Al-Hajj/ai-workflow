import {
  getTriggerType,
  getActionType,
  getAllNodeTemplates,
} from "../catalogService.js";

export class NodeCreationService {
  constructor() {
    this.usedNodeNames = new Set(["Trigger"]);
    this.nodeId = 1;
  }

  reset() {
    this.usedNodeNames = new Set(["Trigger"]);
    this.nodeId = 1;
  }

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

  getTriggerNodeType(trigger) {
    const serviceName = trigger.split(".")[0].toLowerCase();
    if (!serviceName) return "n8n-nodes-base.manualTrigger";

    if (trigger.startsWith("schedule.")) {
      const cronTrigger = getTriggerType("cron");
      return cronTrigger || "n8n-nodes-base.cron";
    }

    const triggerType = getTriggerType(serviceName);
    if (this.validateTrigger(triggerType)) {
      return triggerType;
    }

    // Try with "trigger" suffix
    const triggerWithSuffix = getTriggerType(serviceName + "trigger");
    if (this.validateTrigger(triggerWithSuffix)) {
      return triggerWithSuffix;
    }

    return "n8n-nodes-base.manualTrigger";
  }

  validateTrigger(triggerType) {
    if (!triggerType) return false;
    const catalog = getAllNodeTemplates();
    return Object.values(catalog).some((node) => node.trigger === triggerType);
  }

  getActionNodeType(action) {
    const serviceName = action.split(".")[0].toLowerCase();
    if (action.startsWith("if.")) {
      return "n8n-nodes-base.if";
    }
    if (action.startsWith("httprequest.")) {
      return "n8n-nodes-base.httpRequest";
    }
    if (action.startsWith("wait.") || action.startsWith("delay.")) {
      return "n8n-nodes-base.wait";
    }

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

  createTriggerNode(trigger, triggerParams) {
    return this.createNode({
      name: "Trigger",
      type: this.getTriggerNodeType(trigger),
      position: [0, 0], // Trigger always at origin
      parameters: triggerParams || {},
    });
  }
  createActionNode(actionObj, position) {
    const nodeType = this.getActionNodeType(actionObj.action);
    const uniqueNodeName = this.ensureUniqueNodeName(actionObj.action);

    if (nodeType === "n8n-nodes-base.function") {
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
