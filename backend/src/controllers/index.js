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
    "When a new order arrives in Shippo, perform fraud detection using Sift Science, if fraud is detected block the order and notify the admin via Slack, otherwise validate the customer with Clearbit, check inventory in Airtable, and if stock is low send an email to the supplier via Gmail, else process the order by creating an invoice in QuickBooks and updating the customer record in HubSpot.";

  const userJson = await getUserJsonFromEnglish(englishInput);

  await deployWorkflow(userJson, API_KEY, N8N_URL);

  console.log("ENGLISH INPUT:", englishInput);
  console.log("AI OUTPUT:", JSON.stringify(userJson, null, 2));
}

main();
