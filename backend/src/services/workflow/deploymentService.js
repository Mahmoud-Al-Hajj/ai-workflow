import dotenv from "dotenv";
import { createN8nWorkflow } from "../n8nAuthService.js";

dotenv.config();

/**
 * Write a Definition to a user's n8n Instance. Takes the Definition the caller
 * already built and stored, so n8n holds the same graph the database does.
 */
export async function deployWorkflow(definition, apiKey, n8nUrl) {
  try {
    // n8n rejects a workflow with no settings object.
    definition.settings = definition.settings || {};
    const result = await createN8nWorkflow(apiKey, n8nUrl, definition);

    console.log("Workflow deployed successfully!");
    console.log("Response data:", JSON.stringify(result, null, 2));
    return result.data?.id || result.id;
  } catch (err) {
    console.error("Deployment failed:", err.message);
    throw err;
  }
}
