import dotenv from "dotenv";
import { getUserJsonFromEnglish } from "../services/aiService.js";
import { deployWorkflow } from "../services/deploymentService.js";

dotenv.config();

//this uses the .env variables and its for testing purposes
//and also not to use the apis each time i want to test
const API_KEY = process.env.N8N_API_KEY;
const N8N_URL = process.env.N8N_URL;

async function main() {
  const englishInput =
    "When I receive a new email in Gmail, create an Airtable record, post a message to Slack, send a Twilio SMS, wait 30 minutes, then make an HTTP API call to update my CRM and finally send a Discord notification";
  const userJson = await getUserJsonFromEnglish(englishInput);

  await deployWorkflow(userJson, API_KEY, N8N_URL);

  console.log("ENGLISH INPUT:", englishInput);
  console.log("AI OUTPUT:", JSON.stringify(userJson, null, 2));
}

main();
