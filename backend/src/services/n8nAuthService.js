import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function callN8nWithApiKey(
  apiKey,
  n8nUrl,
  endpoint,
  method = "GET",
  data = null,
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
    console.error("  n8n API call failed:", err.response?.data || err.message);
    throw new Error(
      `n8n API Error: ${err.response?.data?.message || err.message}`,
    );
  }
}

export async function createN8nWorkflow(apiKey, n8nUrl, workflowData) {
  return await callN8nWithApiKey(
    apiKey,
    n8nUrl,
    "/workflows",
    "POST",
    workflowData,
  );
}

