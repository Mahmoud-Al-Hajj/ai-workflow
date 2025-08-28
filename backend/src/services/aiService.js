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
    {
      "action": "<action>",
      "params": { "<k>": "<v>" },
      "mode": "sequential|parallel"
    }
  ]
}

- Each action MUST include a "mode" field: "sequential" OR "parallel"
- "sequential": Action executes after the previous action completes
- "parallel": Action executes simultaneously with other parallel actions from the same trigger point

- Flow Logic Rules:
  * If user says "then", "after", "once completed" → use "sequential"
  * If user says "and", "also", "simultaneously", "at the same time" → use "parallel"
  * Default to "sequential" unless clearly parallel intent
  * First action is always connected to trigger

- Use natural service names (lowercase, no special chars):
  - "WhatsApp" → "whatsapp"
  - "Google Sheets" → "googlesheets" 
  - "Google Drive" → "googledrive"
  - "Google Workspace" → "googleworkspace"
  - "Microsoft 365" → "microsoft365"
  - "OpenAI" → "openai"
  - "Gmail" → "gmail"
  - "Slack" → "slack"
  - "Discord" → "discord"
  - "Notion" → "notion"
  - "Airtable" → "airtable"
  - "Salesforce" → "salesforce"
  - "HubSpot" → "hubspot"
  - "Zapier" → "webhook"
  - "Database" → "postgres" or "mysql"
  - "HTTP Request" → "httprequest"

- For triggers, use format: "servicename.trigger" (e.g., "airtable.trigger", "gmail.trigger")
- For actions, use format: "servicename.action" (e.g., "gmail.send_email", "whatsapp.send_message")

- Parameter Requirements:
  * Email addresses: Must be valid format (user@domain.com)
  * URLs: Must include protocol (https://)
  * IDs/Keys: Use realistic placeholders like "USER_ID_123" not "your_id"
  * Channels: Include # for Slack, @ for Telegram
  * Time: Use standard formats (09:00, 2024-01-01)
  * File paths: Use realistic extensions (.pdf, .xlsx, .png)

- Forbidden Values:
  * Never use: "{{placeholder}}", "<insert_value>", "YOUR_EMAIL"
  * Never use empty objects: {}
  * Never use null or undefined values

- Advanced Patterns:
  * Conditional Logic: If user mentions "if/when X happens", add conditions in params
  * Data Transformation: If user mentions "format", "convert", "transform"
  * Error Handling: If user mentions "if fails", "backup", "fallback"
  * Delays: If user mentions "wait", "after 5 minutes", add delay actions
  * Loops: If user mentions "for each", "repeat", add iteration logic

- Context Inference:
  * If user mentions "my", "me", "I" → infer personal automation
  * If user mentions "team", "company", "organization" → infer business automation
  * If user mentions specific tools → prioritize those integrations
  * If user mentions timing ("daily", "weekly") → add schedule triggers

- Rules:
1. "trigger" must match the event in the input.
2. "actions" can have multiple nodes if input contains "and", "then", "also".
3. Fill required parameters with realistic defaults
4. NEVER return empty strings or placeholders
5. Use common sense for service names
6. Always include "mode" field for each action
7. Verify all actions have realistic, executable parameters
8. Ensure mode assignments reflect user's timing intent

Examples:

Input: Send me an email when a new Google Sheets row is added
Output: { "trigger": "googlesheets.new_row", "actions": [ { "action": "gmail.send_email", "params": { "to": "me@example.com", "subject": "New Row Added", "message": "A new row was added in Google Sheets." }, "mode": "sequential" } ] }

Input: When a new GitHub issue is created, send me an email and post a message in Slack
Output: { "trigger": "github.new_issue", "actions": [ { "action": "gmail.send_email", "params": { "to": "me@example.com", "subject": "New GitHub Issue", "message": "A new issue has been created in GitHub." }, "mode": "parallel" }, { "action": "slack.post_message", "params": { "channel": "#alerts", "message": "A new GitHub issue has been created." }, "mode": "parallel" } ] }

Input: Send an email to test1ing091@gmail.com every morning at 9 AM
Output: { "trigger": "schedule.every_day_9am", "actions": [ { "action": "gmail.send_email", "params": { "to": "test1ing091@gmail.com", "subject": "Daily Reminder", "message": "This is your scheduled 9 AM email." }, "mode": "sequential" } ] }

Input: When someone places a Shopify order, create a Trello card and notify Discord
Output: { "trigger": "shopify.new_order", "actions": [ { "action": "trello.create_card", "params": { "board": "orders", "title": "New Order", "description": "A new order was placed on Shopify." }, "mode": "parallel" }, { "action": "discord.send_message", "params": { "channel": "#orders", "message": "New Shopify order received!" }, "mode": "parallel" } ] }

Input: Create an Airtable record and send a Telegram message when I get a webhook
Output: { "trigger": "webhook.received", "actions": [ { "action": "airtable.create_record", "params": { "table": "leads", "fields": { "source": "webhook", "status": "new" } }, "mode": "parallel" }, { "action": "telegram.send_message", "params": { "chat_id": "@notifications", "message": "New webhook received and processed." }, "mode": "parallel" } ] }

Input: When new lead comes in, send welcome email immediately, then wait 2 hours and send follow-up, also notify sales team right away
Output: { "trigger": "webhook.new_lead", "actions": [ { "action": "gmail.send_email", "params": { "to": "lead@example.com", "subject": "Welcome!", "message": "Thanks for your interest!" }, "mode": "parallel" }, { "action": "slack.post_message", "params": { "channel": "#sales", "message": "New lead received" }, "mode": "parallel" }, { "action": "delay.wait", "params": { "duration": "2h" }, "mode": "sequential" }, { "action": "gmail.send_email", "params": { "to": "lead@example.com", "subject": "Follow-up", "message": "How can we help you further?" }, "mode": "sequential" } ] }

Input: First send email, then wait 5 minutes, then post to Slack
Output: { "trigger": "webhook.start", "actions": [ { "action": "gmail.send_email", "params": { "to": "user@example.com", "subject": "Process Started", "message": "Workflow has begun." }, "mode": "sequential" }, { "action": "delay.wait", "params": { "duration": "5m" }, "mode": "sequential" }, { "action": "slack.post_message", "params": { "channel": "#updates", "message": "Process completed after delay." }, "mode": "sequential" } ] }

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
