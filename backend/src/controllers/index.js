import dotenv from "dotenv";
import { getUserJsonFromEnglish } from "../services/aiService.js";
import { deployWorkflow } from "../services/workflow/deploymentService.js";

dotenv.config();

//this uses the .env variables and its for testing purposes
//and also not to use the apis each time i want to test
const API_KEY = process.env.N8N_API_KEY;
const N8N_URL = process.env.N8N_URL;

async function main() {
  const englishInput =
    "When a new lead comes in from our website contact form, first validate their email address and check if they're already in our CRM system. If they're a new lead, calculate their lead score based on company size (1000+ employees = 30 points, 100-999 = 20 points, 10-99 = 10 points), industry (tech/healthcare/finance = 25 bonus points), and contact completeness (email = 20 points, phone = 15 points). Then create them in Salesforce with the calculated score and send a personalized welcome email based on their industry - for tech companies use subject Accelerate Your Tech Innovation with content about scalable solutions, for healthcare use HIPAA-Compliant Solutions for Healthcare with content about secure systems, for finance use Enterprise-Grade Financial Solutions with content about robust platforms, and for others use Transform Your Business Operations with general business content. After sending the email, assign a sales representative based on their location - US leads go to John with email john@company.com, EU leads go to Sarah with email sarah@company.com, and all other leads go to Mike with email mike@company.com. Then wait 2 hours and check their email engagement. If they opened the email, schedule a follow-up call and notify the assigned sales rep on Slack. If they didn't engage, add them to a nurture email sequence. For all leads regardless of engagement, also check if they visited our pricing page in the last 24 hours - if yes, immediately send an urgent Slack notification to the sales-urgent channel and create a hot lead entry in Airtable. If any step fails during processing, retry up to 3 times with exponential backoff (2 seconds, 4 seconds, 8 seconds), and if still failing after 3 attempts, log the detailed error to our PostgreSQL errors table and send an SMS alert to the admin at +1-555-123-4567 with the specific failure details.";
  const userJson = await getUserJsonFromEnglish(englishInput);

  await deployWorkflow(userJson, API_KEY, N8N_URL);

  console.log("ENGLISH INPUT:", englishInput);
  console.log("AI OUTPUT:", JSON.stringify(userJson, null, 2));
}

main();
