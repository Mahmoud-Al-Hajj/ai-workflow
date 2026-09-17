# Users bring their own n8n instance

Every User supplies the URL and API key of an n8n Instance they run themselves, stored on the User record at registration. This service hosts no n8n, executes nothing, and holds no automation runtime of its own — it generates Definitions and writes them to someone else's server.

We chose this over operating a multi-tenant n8n because running other people's automations means running their credentials, their outbound traffic and their failures. Staying out of the execution path removes that entire class of operational and liability surface, and it means a User's Slack token or database password never reaches us.

## Consequences

The trade is observability. Once a Deployment succeeds we hold only the n8n workflow id; we cannot see whether the automation ever ran, tell a user why theirs is failing, or fix it for them. A Workflow marked `ACTIVE` means "n8n accepted it", not "it works". Anything resembling run history, execution logs or health status would require polling each User's Instance with their key, which is a genuinely different product shape — not a feature to be added quietly.

n8n credentials are also now a hard dependency of registration: a User cannot be created without them, and a Workflow cannot be created if they are missing or no longer valid.
