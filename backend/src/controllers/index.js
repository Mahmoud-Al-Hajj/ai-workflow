import dotenv from "dotenv";
import { getUserJsonFromEnglish } from "../services/aiService.js";
import { deployWorkflow } from "../services/deploymentService.js";

// Load environment variables
dotenv.config();

const EMAIL = process.env.N8N_EMAIL;
const PASSWORD = process.env.N8N_PASSWORD;

async function main() {
  const englishInput =
    "EveryDay create a post about haiku anime and post it in my telegram channel"; // Convert English → JSON intent
  const userJson = await getUserJsonFromEnglish(englishInput);

  // Deploy workflow
  await deployWorkflow(userJson, EMAIL, PASSWORD);

  console.log("ENGLISH INPUT:", englishInput);
  console.log("AI OUTPUT:", JSON.stringify(userJson, null, 2));
}

main();
