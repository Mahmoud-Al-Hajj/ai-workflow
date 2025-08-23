import { getAllNodeTemplates } from "./catalogService.js";

const nodeCatalog = getAllNodeTemplates();

function buildWorkflow(userJson) {
  const workflow = {
    name: "AI Generated Workflow",
    nodes: [],
    connections: {},
    active: false,
  };
  //create a new workflow object and initialize it.
  let nodeId = 1;

  // Add trigger node
  workflow.nodes.push({
    id: `${nodeId}`,
    name: "Trigger",
    type: getTriggerNodeType(userJson.trigger),
    typeVersion: 1,
    position: [250, 300],
    parameters: {},
  });

  nodeId++;

  // Add all action nodes dynamically
  for (const actionObj of userJson.actions) {
    // Use dynamic node mapping for ALL services
    const nodeType = getActionNodeType(actionObj.action);

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
function getTriggerNodeType(trigger) {
  // Extract service name (everything before first dot)
  const serviceName = trigger.split(".")[0].toLowerCase();

  // Try to find trigger version first
  const triggerNodeName = serviceName + "trigger"; // e.g., "airtabletrigger"
  if (nodeCatalog[triggerNodeName]) {
    return nodeCatalog[triggerNodeName];
  }

  // Fallback to manual trigger
  return "n8n-nodes-base.manualTrigger";
}

// Dynamic action node type mapping using node catalog
function getActionNodeType(action) {
  // Extract service name (everything before first dot)
  const serviceName = action.split(".")[0].toLowerCase();

  // Use the dynamic node catalog directly
  return nodeCatalog[serviceName] || "n8n-nodes-base.set";
}

export { buildWorkflow };
