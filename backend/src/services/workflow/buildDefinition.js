import {
  getTriggerType,
  getActionType,
  getAllNodeTemplates,
} from "../catalogService.js";
import { applyLayout } from "./layout.js";

const MANUAL_TRIGGER = "n8n-nodes-base.manualTrigger";
const FUNCTION_NODE = "n8n-nodes-base.function";

// Services the Catalog misses often enough to be worth naming here.
const FALLBACK_NODE_TYPES = {
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

const TYPE_VERSIONS = {
  "n8n-nodes-base.if": 2.2,
  "n8n-nodes-base.httpRequest": 1,
  "n8n-nodes-base.wait": 1,
  "n8n-nodes-base.cron": 1,
  "n8n-nodes-base.manualTrigger": 1,
  "n8n-nodes-base.webhook": 1,
};

const typeVersionFor = (nodeType) => TYPE_VERSIONS[nodeType] || 1;

const isCondition = (action) => action.startsWith("if.");

// NOTE: getAllNodeTemplates() returns Service Name -> node type strings, so
// `node.trigger` is always undefined and this always returns false. Preserved
// as-is: fixing it changes which node type every non-schedule Trigger resolves
// to, which is a behaviour change, not part of this refactor.
function isKnownTrigger(triggerType) {
  if (!triggerType) return false;
  const catalog = getAllNodeTemplates();
  return Object.values(catalog).some((node) => node.trigger === triggerType);
}

function resolveTriggerType(trigger) {
  const serviceName = trigger.split(".")[0].toLowerCase();
  if (!serviceName) return MANUAL_TRIGGER;

  if (trigger.startsWith("schedule.")) {
    return getTriggerType("cron") || "n8n-nodes-base.cron";
  }

  const direct = getTriggerType(serviceName);
  if (isKnownTrigger(direct)) return direct;

  const suffixed = getTriggerType(serviceName + "trigger");
  if (isKnownTrigger(suffixed)) return suffixed;

  return MANUAL_TRIGGER;
}

function resolveActionType(action) {
  const serviceName = action.split(".")[0].toLowerCase();

  if (isCondition(action)) return "n8n-nodes-base.if";
  if (action.startsWith("httprequest.")) return "n8n-nodes-base.httpRequest";
  if (action.startsWith("wait.") || action.startsWith("delay.")) {
    return "n8n-nodes-base.wait";
  }

  return (
    getActionType(serviceName) ||
    FALLBACK_NODE_TYPES[serviceName] ||
    FUNCTION_NODE
  );
}

/**
 * Per-build state: Node ids, the names already taken, and the head of each
 * execution path. Created fresh for every Definition, so two builds running at
 * once cannot see each other's chains.
 */
function createBuildState() {
  const usedNodeNames = new Set(["Trigger"]);
  const connections = {};
  let nodeId = 1;

  // Head of each path through the graph as it is assembled.
  let mainChain = "Trigger";
  let parallelChain = null;
  let trueBranchChain = null;
  let falseBranchChain = null;
  let currentIfNode = null;

  const clearBranchChains = () => {
    trueBranchChain = null;
    falseBranchChain = null;
  };

  function createNode({ name, type, position, parameters }) {
    const node = {
      id: nodeId.toString(),
      name,
      type,
      typeVersion: typeVersionFor(type),
      position,
      parameters: parameters || {},
    };
    nodeId++;
    return node;
  }

  function claimNodeName(baseName) {
    let uniqueName = baseName;
    let counter = 2;

    while (usedNodeNames.has(uniqueName)) {
      uniqueName = `${baseName}_${counter}`;
      counter++;
    }

    usedNodeNames.add(uniqueName);
    return uniqueName;
  }

  function addConnection(fromNode, toNode, outputIndex = 0, inputIndex = 0) {
    if (!connections[fromNode]) {
      connections[fromNode] = { main: [] };
    }
    if (!connections[fromNode].main[outputIndex]) {
      connections[fromNode].main[outputIndex] = [];
    }

    connections[fromNode].main[outputIndex].push({
      node: toNode,
      type: "main",
      index: inputIndex,
    });
  }

  // A branch Action chains onto the last Node in its own branch, or onto the
  // Condition itself if it is the first: output 0 is the true path, 1 the false.
  function branchSource(isTrueBranch) {
    const branchChain = isTrueBranch ? trueBranchChain : falseBranchChain;

    if (branchChain) return { sourceNode: branchChain, outputIndex: 0 };

    if (currentIfNode) {
      return {
        sourceNode: currentIfNode,
        outputIndex: isTrueBranch ? 0 : 1,
      };
    }

    return { sourceNode: mainChain, outputIndex: 0 };
  }

  function sourceForMode(mode) {
    switch (mode) {
      case "branch_true":
        return branchSource(true);
      case "branch_false":
        return branchSource(false);
      case "parallel":
        return { sourceNode: parallelChain || "Trigger", outputIndex: 0 };
      case "sequential":
      default:
        return { sourceNode: mainChain, outputIndex: 0 };
    }
  }

  function advanceChains(mode, nodeName) {
    switch (mode) {
      case "sequential":
        mainChain = nodeName;
        // Returning to the main flow ends any branch or parallel run.
        clearBranchChains();
        parallelChain = null;
        break;

      case "parallel":
        parallelChain = nodeName;
        break;

      case "branch_true":
        trueBranchChain = nodeName;
        falseBranchChain = null;
        break;

      case "branch_false":
        falseBranchChain = nodeName;
        trueBranchChain = null;
        break;
    }
  }

  function connectNode(actionObj, nodeName) {
    const { sourceNode, outputIndex } = sourceForMode(actionObj.mode);

    if (isCondition(actionObj.action)) {
      // Entering a new Condition resets branch tracking.
      if (currentIfNode !== nodeName) clearBranchChains();
      currentIfNode = nodeName;
    }

    if (sourceNode) addConnection(sourceNode, nodeName, outputIndex, 0);

    advanceChains(actionObj.mode, nodeName);
  }

  return { createNode, claimNodeName, connectNode, connections };
}

/**
 * Turn a Plan into a Definition: one Trigger Node, one Node per Action, wired
 * according to each Action's Mode, then laid out.
 */
export function buildDefinition(plan) {
  const state = createBuildState();

  const definition = {
    name: "AI Generated Workflow",
    nodes: [],
    connections: {},
    settings: { saveExecutionProgress: true },
  };

  definition.nodes.push(
    state.createNode({
      name: "Trigger",
      type: resolveTriggerType(plan.trigger),
      position: [0, 0],
      parameters: plan.triggerParams || {},
    }),
  );

  for (const actionObj of plan.actions) {
    const nodeType = resolveActionType(actionObj.action);
    const nodeName = state.claimNodeName(actionObj.action);

    definition.nodes.push(
      state.createNode({
        name: nodeName,
        type: nodeType,
        // Placeholder: applyLayout assigns every position at the end.
        position: [0, 0],
        parameters: parametersFor(nodeType, actionObj),
      }),
    );

    state.connectNode(actionObj, nodeName);
  }

  definition.connections = state.connections;

  return applyLayout(definition);
}

// n8n has used several names for a function Node's body across versions, so
// the code is written to all of them.
function parametersFor(nodeType, actionObj) {
  if (nodeType !== FUNCTION_NODE) return actionObj.params || {};

  return {
    functionCode: actionObj.params.code,
    code: actionObj.params.code,
    jsCode: actionObj.params.code,
    language: "javascript",
  };
}
