import dotenv from "dotenv";
import { createN8nWorkflow } from "../n8nAuthService.js";
import { buildDefinition } from "./buildDefinition.js";

dotenv.config();

export async function deployWorkflow(userJson, apiKey, n8nUrl) {
  try {
    const workflow = buildDefinition(userJson);
    // Add required settings property
    workflow.settings = workflow.settings || {};
    const result = await createN8nWorkflow(apiKey, n8nUrl, workflow);

    console.log("Workflow deployed successfully!");
    console.log("Response data:", JSON.stringify(result, null, 2));
    return result.data?.id || result.id;
  } catch (err) {
    console.error("Deployment failed:", err.message);
    throw err;
  }
}
