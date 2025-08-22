import dotenv from "dotenv";
import axios from "axios";
import { loginToN8n } from "./n8nAuthService.js";
import { buildWorkflow } from "./workflowService.js";

// Load environment variables
dotenv.config();

export async function deployWorkflow(userJson, email, password) {
  try {
    const { token, cookie } = await loginToN8n(email, password);

    // Build workflow dynamically
    const workflow = buildWorkflow(userJson);

    // Deploy to n8n
    const n8nUrl = process.env.N8N_URL || "http://localhost:5678";
    const res = await axios.post(`${n8nUrl}/rest/workflows`, workflow, {
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token,
        Cookie: cookie,
      },
    });

    console.log("✅ Workflow deployed successfully!");
    console.log("Response data:", JSON.stringify(res.data, null, 2));
    return res.data.data?.id || res.data.id || res.data.workflowId;
  } catch (err) {
    console.error("❌ Deployment failed:", err.response?.data || err.message);
  }
}
