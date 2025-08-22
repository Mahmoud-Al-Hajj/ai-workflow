import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllNodeTemplates() {
  const catalogPath = path.join(__dirname, "../templates/nodeTemplates.json");

  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Node catalog not found: ${catalogPath}`);
  }

  const catalogData = fs.readFileSync(catalogPath, "utf8");
  return JSON.parse(catalogData);
}

export { getAllNodeTemplates };
