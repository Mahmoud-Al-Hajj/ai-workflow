import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllNodeTemplates() {
  const catalogPath = path.join(__dirname, "../templates/officialN8nNodes.json");

  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Node catalog not found: ${catalogPath}`);
  }

  const catalogData = fs.readFileSync(catalogPath, "utf8");
  const nodes = JSON.parse(catalogData);
  
  // Convert to simple mapping format for workflowService
  const nodeMap = {};
  Object.values(nodes).forEach(node => {
    const serviceName = node.name.toLowerCase();
    nodeMap[serviceName] = node.type;
  });
  
  return nodeMap;
}

export { getAllNodeTemplates };
