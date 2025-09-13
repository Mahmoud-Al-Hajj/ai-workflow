import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export async function callN8nWithApiKey(
  apiKey,
  n8nUrl,
  endpoint,
  method = "GET",
  data = null
) {
  try {
    // n8n API uses /api/v1/ for public API endpoints
    const url = `${n8nUrl}/api/v1${endpoint}`;

    const config = {
      method,
      url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-N8N-API-KEY": apiKey, // n8n API key authentication
      },
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (err) {
    console.error("❌ n8n API call failed:", err.response?.data || err.message);
    throw new Error(
      `n8n API Error: ${err.response?.data?.message || err.message}`
    );
  }
}

export async function validateN8nApiKey(apiKey, n8nUrl) {
  try {
    // Use workflows endpoint to test API key (simpler than user endpoint)
    const result = await callN8nWithApiKey(apiKey, n8nUrl, "/workflows");
    console.log("✅ n8n API key is valid");
    return true;
  } catch (err) {
    console.error("❌ Invalid n8n API key:", err.message);
    return false;
  }
}

export async function getN8nWorkflows(apiKey, n8nUrl) {
  return await callN8nWithApiKey(apiKey, n8nUrl, "/workflows");
}

export async function createN8nWorkflow(apiKey, n8nUrl, workflowData) {
  return await callN8nWithApiKey(
    apiKey,
    n8nUrl,
    "/workflows",
    "POST",
    workflowData
  );
}

//   Activate/deactivate a workflow

// export async function toggleN8nWorkflow(
//   apiKey,
//   n8nUrl,
//   workflowId,
//   active = true
// ) {
//   return await callN8nWithApiKey(
//     apiKey,
//     n8nUrl,
//     `/workflows/${workflowId}/activate`,
//     "POST",
//     { active }
//   );
// }
