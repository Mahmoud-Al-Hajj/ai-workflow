import dotenv from "dotenv";
import axios from "axios";

// Load environment variables
dotenv.config();

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

- Always use canonical node names exactly as listed:
Triggers: "google_sheets.new_row", "github.new_issue", "schedule.every_day_9am", "webhook.received", "shopify.new_order", "airtable.new_record", "typeform.new_submission", "discord.new_message", "telegram.new_message", "trello.new_card", "notion.new_page"
Actions: "gmail.send_email", "slack.post_message", "discord.send_message", "telegram.send_message", "trello.create_card", "notion.create_page", "airtable.create_record", "hubspot.create_contact", "shopify.create_order", "stripe.create_payment", "twitter.post_tweet", "linkedin.post_update", "dropbox.upload_file", "zendesk.create_ticket", "asana.create_task", "monday.create_item", "clickup.create_task", "jira.create_issue", "wordpress.create_post", "mailchimp.add_subscriber", "calendly.schedule_meeting", "zoom.create_meeting", "facebook.post_update", "instagram.post_photo", "youtube.upload_video", "reddit.post_content", "medium.publish_article", "github.create_issue", "gitlab.create_issue", "bitbucket.create_issue", "aws.upload_s3", "box.upload_file", "onedrive.upload_file", "googledrive.upload_file", "salesforce.create_lead", "pipedrive.create_deal", "freshdesk.create_ticket", "intercom.send_message", "drift.send_message", "crisp.send_message", "twilio.send_sms", "vonage.send_sms", "sendgrid.send_email", "mailgun.send_email", "postmark.send_email", "brevo.send_email", "convertkit.add_subscriber", "getresponse.add_subscriber", "activecampaign.add_contact", "klaviyo.add_subscriber", "eventbrite.create_event", "meetup.create_event", "paypal.create_payment", "square.create_payment", "quickbooks.create_invoice", "xero.create_invoice", "harvest.create_project", "toggl.create_project", "clockify.create_project", "linear.create_issue", "height.create_task", "coda.create_row", "baserow.create_row", "nocodb.create_row", "supabase.insert_data", "firebase.insert_data", "mysql.insert_data", "postgres.insert_data", "mongodb.insert_data", "redis.set_value", "elasticsearch.index_document", "meilisearch.index_document", "algolia.index_object", "pinecone.upsert_vector", "weaviate.create_object", "qdrant.upsert_point", "openai.generate_text", "anthropic.generate_text", "cohere.generate_text", "huggingface.generate_text", "replicate.run_model", "stability.generate_image", "midjourney.generate_image", "dall-e.generate_image"

- Rules:
1. "trigger" must match the event in the input.
2. "actions" can have multiple nodes if input contains "and", "then", "also".
3. Fill all required parameters. If missing, supply defaults:
   - gmail.send_email: "to"="me@example.com", "subject"=short intent summary, "message"=full intent message
   - slack.post_message: "channel"="#general", "message"=full intent message
   - discord.send_message: "channel"="general", "message"=full intent message
   - telegram.send_message: "chat_id"="@notifications", "message"=full intent message
   - trello.create_card: "board"="main", "title"=short summary, "description"=full intent message
   - notion.create_page: "database"="main", "title"=short summary, "content"=full intent message
   - airtable.create_record: "table"="main", "fields"=relevant data object
   - hubspot.create_contact: "email"="contact@example.com", "firstname"="New", "lastname"="Contact"
   - shopify.create_order: "customer"=customer object, "line_items"=items array
   - twitter.post_tweet: "message"=full intent message (max 280 chars)
   - linkedin.post_update: "message"=full intent message
   - zendesk.create_ticket: "subject"=short summary, "description"=full intent message
   - asana.create_task: "name"=short summary, "notes"=full intent message
   - jira.create_issue: "summary"=short summary, "description"=full intent message, "issuetype"="Task"
4. NEVER return empty strings or placeholders.
5. Output must be deployable directly in n8n.

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
