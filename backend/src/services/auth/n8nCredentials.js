import { decrypt } from "../../utils/crypto.js";

/**
 * Raised when a User's n8n Instance credentials cannot be used. `reason`
 * separates "they never configured any" from "what we stored will not
 * decrypt", which callers report differently.
 */
export class N8nCredentialsError extends Error {
  constructor(message, reason) {
    super(message);
    this.name = "N8nCredentialsError";
    this.reason = reason; // "missing" | "undecryptable"
  }
}

/**
 * Turn a stored User record into n8n Instance credentials that can actually be
 * used. The API key is held encrypted at rest (see ADR-0004), so it has to be
 * decrypted before every Deployment — this is the one place that happens.
 */
export function resolveN8nCredentials(user) {
  if (!user?.n8nUrl || !user?.n8nApiKey) {
    throw new N8nCredentialsError(
      "n8n credentials not configured. Please update your profile with valid n8n credentials.",
      "missing",
    );
  }

  try {
    return { n8nUrl: user.n8nUrl, n8nApiKey: decrypt(user.n8nApiKey) };
  } catch {
    throw new N8nCredentialsError(
      "Failed to decrypt n8n credentials. Please reconfigure your profile.",
      "undecryptable",
    );
  }
}
