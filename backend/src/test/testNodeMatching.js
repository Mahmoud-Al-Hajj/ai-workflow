import { nodeMatchingService } from "../services/workflow/nodeMatchingService.js";

// Test the node matching service
console.log("=== Testing Node Matching Service ===\n");

const testInputs = [
  "Send a notification to Discord when someone submits a Typeform",
  "Create an Airtable record when I get a Stripe payment",
  "Post to LinkedIn when I publish a new blog post",
  "Send a Twilio SMS when someone books a Calendly appointment",
  "Create a Notion page when a GitHub issue is created",
  "Send a welcome email and Slack notification when a new lead comes in, then wait 2 hours and send a follow-up email",
];

testInputs.forEach((input, index) => {
  console.log(`Test ${index + 1}: "${input}"`);

  const mentionedServices = nodeMatchingService.extractMentionedServices(input);
  console.log("Extracted services:", mentionedServices);

  const mappings = nodeMatchingService.generateServiceMappings(input);
  console.log("Generated mappings:", mappings);
  console.log("---\n");
});
