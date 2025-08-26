import dotenv from "dotenv";
import { getUserJsonFromEnglish } from "./services/aiService.js";
import { deployWorkflow } from "./services/deploymentService.js";

// Load environment variables
dotenv.config();

const API_KEY = process.env.N8N_API_KEY;
const N8N_URL = process.env.N8N_URL;

async function main() {
  const englishInput =
    "Every Monday at 9 AM, pull data from Airtable, generate a report with OpenAI, post it to Notion, and share in Discord";
  // Convert English → JSON intent
  const userJson = await getUserJsonFromEnglish(englishInput);

  // Deploy workflow using API key
  await deployWorkflow(userJson, API_KEY, N8N_URL);

  console.log("ENGLISH INPUT:", englishInput);
  console.log("AI OUTPUT:", JSON.stringify(userJson, null, 2));
}

main();
