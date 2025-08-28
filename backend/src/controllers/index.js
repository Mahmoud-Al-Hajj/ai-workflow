import dotenv from "dotenv";
import { getUserJsonFromEnglish } from "../services/aiService.js";
import { deployWorkflow } from "../services/deploymentService.js";

// Load environment variables
dotenv.config();

const API_KEY = process.env.N8N_API_KEY;
const N8N_URL = process.env.N8N_URL;

async function main() {
  const englishInput =
    "Every Monday at 9 AM, pull new leads from Airtable, clean the data with OpenAI, then save it in Google Sheets. At the same time, send a summary email to the sales team and a Slack notification to the marketing channel.";

  const userJson = await getUserJsonFromEnglish(englishInput);

  await deployWorkflow(userJson, API_KEY, N8N_URL);

  console.log("ENGLISH INPUT:", englishInput);
  console.log("AI OUTPUT:", JSON.stringify(userJson, null, 2));
}

main();
