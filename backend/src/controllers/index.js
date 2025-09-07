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
    "When a new Shopify order is received, validate the customer data using Clearbit, check inventory levels in Airtable, if stock is low send urgent Slack notification to warehouse team and email to supplier, otherwise process the order by creating invoice in QuickBooks, sending confirmation email via Gmail, posting order summary to Discord channel, and updating customer record in HubSpot with order details and purchase history.";
  const userJson = await getUserJsonFromEnglish(englishInput);

  await deployWorkflow(userJson, API_KEY, N8N_URL);

  console.log("ENGLISH INPUT:", englishInput);
  console.log("AI OUTPUT:", JSON.stringify(userJson, null, 2));
}

main();
