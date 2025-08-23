import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Load official nodes and generate service list

export async function getUserJsonFromEnglish(description) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const systemInstruction = `
You are an expert AI that converts any natural language workflow description into a valid n8n workflow JSON.

- Output ONLY a JSON object. No text, no markdown, no comments, no code fences.
- JSON schema must be strictly followed:
{
  "trigger": "<trigger>",
  "actions": [
    { "action": "<action>", "params": { "<k>": "<v>" } }
  ]
}

- Use natural service names (lowercase, no special chars):
  - "WhatsApp" → "whatsapp"
  - "Google Sheets" → "googlesheets" 
  - "Google Drive" → "googledrive"
  - "OpenAI" → "openai"
  - "Gmail" → "gmail"
  - "Slack" → "slack"
  - "Discord" → "discord"
  - "Notion" → "notion"
  - "Airtable" → "airtable"

- For triggers, use format: "servicename.trigger" (e.g., "airtable.trigger", "gmail.trigger")
- For actions, use format: "servicename.action" (e.g., "gmail.send_email", "whatsapp.send_message")

- Rules:
1. "trigger" must match the event in the input.
2. "actions" can have multiple nodes if input contains "and", "then", "also".
3. Fill required parameters with realistic defaults
4. NEVER return empty strings or placeholders
5. Use common sense for service names

Examples:

Input: Send me an email when a new Google Sheets row is added
Output: { "trigger": "google_sheets.new_row", "actions": [ { "action": "gmail.send_email", "params": { "to": "me@example.com", "subject": "New Row Added", "message": "A new row was added in Google Sheets." } } ] }

Input: When a new GitHub issue is created, send me an email and post a message in Slack
Output: { "trigger": "github.new_issue", "actions": [ { "action": "gmail.send_email", "params": { "to": "me@example.com", "subject": "New GitHub Issue", "message": "A new issue has been created in GitHub." } }, { "action": "slack.post_message", "params": { "channel": "#alerts", "message": "A new GitHub issue has been created." } } ] }

Input: Send an email to test1ing091@gmail.com every morning at 9 AM
Output: { "trigger": "schedule.every_day_9am", "actions": [ { "action": "gmail.send_email", "params": { "to": "test1ing091@gmail.com", "subject": "Daily Reminder", "message": "This is your scheduled 9 AM email." } } ] }

Input: When someone places a Shopify order, create a Trello card and notify Discord
Output: { "trigger": "shopify.new_order", "actions": [ { "action": "trello.create_card", "params": { "board": "orders", "title": "New Order", "description": "A new order was placed on Shopify." } }, { "action": "discord.send_message", "params": { "channel": "orders", "message": "New Shopify order received!" } } ] }

Input: Create an Airtable record and send a Telegram message when I get a webhook
Output: { "trigger": "webhook.received", "actions": [ { "action": "airtable.create_record", "params": { "table": "leads", "fields": { "source": "webhook", "status": "new" } } }, { "action": "telegram.send_message", "params": { "chat_id": "@notifications", "message": "New webhook received and processed." } } ] }

`;

  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: description }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 500,
      responseMimeType: "application/json",
    },
  };

  const resp = await axios.post(url, body, {
    headers: { "Content-Type": "application/json" },
  });

  const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(
      "Gemini returned no text: " + JSON.stringify(resp.data, null, 2)
    );
  }

  // Clean text in case AI adds any extra markdown/code fences
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned); // pure JSON object
  } catch (err) {
    throw new Error("Failed to parse JSON from Gemini output: " + cleaned);
  }
}
