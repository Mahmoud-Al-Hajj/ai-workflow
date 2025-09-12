import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllNodeTemplates() {
  const enhancedCatalogPath = path.join(
    __dirname,
    "../templates/enhancedNodeCatalog.json"
  );
  const originalCatalogPath = path.join(
    __dirname,
    "../templates/officialN8nNodes.json"
  );

  // Load enhanced catalog
  const enhancedNodes = JSON.parse(
    fs.readFileSync(enhancedCatalogPath, "utf8")
  );
  const originalNodes = JSON.parse(
    fs.readFileSync(originalCatalogPath, "utf8")
  );

  // Convert enhanced catalog to simple mapping format
  const nodeMap = {};
  Object.entries(enhancedNodes).forEach(([serviceName, nodeInfo]) => {
    // Use action type as primary, fallback to trigger if no action
    const nodeType = nodeInfo.action || nodeInfo.trigger;
    if (nodeType) {
      nodeMap[serviceName.toLowerCase()] = nodeType;
    }
  });

  // Add missing nodes from original catalog
  Object.values(originalNodes).forEach((node) => {
    const serviceName = node.name.toLowerCase();
    if (!nodeMap[serviceName]) {
      nodeMap[serviceName] = node.type;
    }
  });

  return nodeMap;
}

function getEnhancedNodeCatalog() {
  const catalogPath = path.join(
    __dirname,
    "../templates/enhancedNodeCatalog.json"
  );

  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Enhanced node catalog not found: ${catalogPath}`);
  }

  const catalogData = fs.readFileSync(catalogPath, "utf8");
  return JSON.parse(catalogData);
}

function getNodeInfo(serviceName) {
  const catalog = getEnhancedNodeCatalog();
  const nodeInfo = catalog[serviceName.toLowerCase()];

  if (nodeInfo) {
    return nodeInfo;
  }

  // Fallback to original catalog for missing nodes
  const originalCatalogPath = path.join(
    __dirname,
    "../templates/officialN8nNodes.json"
  );
  const originalNodes = JSON.parse(
    fs.readFileSync(originalCatalogPath, "utf8")
  );

  const originalNode = Object.values(originalNodes).find(
    (node) => node.name.toLowerCase() === serviceName.toLowerCase()
  );

  if (originalNode) {
    return {
      action: originalNode.type,
      trigger: null,
      displayName: originalNode.name,
      description: "",
      group: [],
    };
  }

  return null;
}

function getTriggerType(serviceName) {
  const nodeInfo = getNodeInfo(serviceName);
  return nodeInfo?.trigger || null;
}

function getActionType(serviceName) {
  const nodeInfo = getNodeInfo(serviceName);
  return nodeInfo?.action || null;
}

function getAllServices() {
  const catalog = getEnhancedNodeCatalog();
  return Object.keys(catalog);
}

export {
  getAllNodeTemplates,
  getEnhancedNodeCatalog,
  getNodeInfo,
  getTriggerType,
  getActionType,
  getAllServices,
};
