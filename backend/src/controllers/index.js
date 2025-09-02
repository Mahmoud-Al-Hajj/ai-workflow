import dotenv from "dotenv";
import { getUserJsonFromEnglish } from "../services/aiService.js";
import { deployWorkflow } from "../services/deploymentService.js";

// Load environment variables
dotenv.config();

const API_KEY = process.env.N8N_API_KEY;
const N8N_URL = process.env.N8N_URL;

async function main() {
  const englishInput =
    "If the lead score is excellent, send immediate personalized email, SMS notification, and create a high-priority task for the sales team. If the lead score is good, send email only and add to nurture campaign. If the lead score is poor, add to general newsletter and log for review. For all leads, update the CRM record regardless of score.";
  const userJson = await getUserJsonFromEnglish(englishInput);

  await deployWorkflow(userJson, API_KEY, N8N_URL);

  console.log("ENGLISH INPUT:", englishInput);
  console.log("AI OUTPUT:", JSON.stringify(userJson, null, 2));
}

main();
