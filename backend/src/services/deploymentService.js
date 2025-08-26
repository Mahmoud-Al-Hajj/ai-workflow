import dotenv from "dotenv";
import { createN8nWorkflow } from "./n8nAuthService.js";
import { buildWorkflow } from "./WorkflowService.js";

// Load environment variables
dotenv.config();

export async function deployWorkflow(userJson, apiKey, n8nUrl) {
  try {
    // Build workflow dynamically
    const workflow = buildWorkflow(userJson);

    // Add required settings property
    workflow.settings = workflow.settings || {};

    // Deploy to n8n using API key
    const result = await createN8nWorkflow(apiKey, n8nUrl, workflow);

    console.log("✅ Workflow deployed successfully!");
    console.log("Response data:", JSON.stringify(result, null, 2));
    return result.data?.id || result.id;
  } catch (err) {
    console.error("❌ Deployment failed:", err.message);
    throw err;
  }
}

// Legacy function for backward compatibility - uses env variables
//fene sheela bas khaleha for now
export async function deployWorkflowLegacy(userJson, email, password) {
  const apiKey = process.env.N8N_API_KEY;
  const n8nUrl = process.env.N8N_URL;

  if (!apiKey) {
    throw new Error("N8N_API_KEY not found in environment variables");
  }

  console.log("🔄 Converting to API key authentication...");
  return await deployWorkflow(userJson, apiKey, n8nUrl);
}
