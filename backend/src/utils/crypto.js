import crypto from "crypto";

// Use AES-256-GCM for authenticated encryption
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Recommended IV length for GCM
const KEY_LENGTH = 32; // 256 bits

function getKey() {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET env var must be set");
  }
  // Derive a 32-byte key from the secret using SHA-256
  return crypto.createHash("sha256").update(secret).digest();
}

// Output format: base64(iv):base64(ciphertext):base64(authTag)
export function encrypt(text) {
  if (typeof text !== "string") throw new TypeError("encrypt expects a string");
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: 16,
  });
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${encrypted.toString(
    "base64"
  )}:${authTag.toString("base64")}`;
}

export function decrypt(encryptedText) {
  if (typeof encryptedText !== "string")
    throw new TypeError("decrypt expects a string");
  const parts = encryptedText.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted text format");
  const [ivB64, encryptedB64, authTagB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");

  if (iv.length !== IV_LENGTH) throw new Error("Invalid IV length");

  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: 16,
  });
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export default { encrypt, decrypt };
