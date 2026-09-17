import dotenv from "dotenv";
import { getUserJsonFromEnglish } from "../services/aiService.js";
import { deployWorkflow } from "../services/workflow/deploymentService.js";
import { buildDefinition } from "../services/workflow/buildDefinition.js";

dotenv.config();

const API_KEY = process.env.N8N_API_KEY;
const N8N_URL = process.env.N8N_URL;

async function main() {
  const englishInput =
    "When a payment webhook is received from Stripe, update the customer record and send a confirmation email.";
  const plan = await getUserJsonFromEnglish(englishInput);

  await deployWorkflow(buildDefinition(plan), API_KEY, N8N_URL);

  console.log("ENGLISH INPUT:", englishInput);
  console.log("AI OUTPUT:", JSON.stringify(plan, null, 2));
}

main();
