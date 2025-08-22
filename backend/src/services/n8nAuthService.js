import dotenv from "dotenv";
import axios from "axios";

// Load environment variables
dotenv.config();

/**
 * Logs in to n8n and returns an object with csrfToken and cookie
 */
export async function loginToN8n(email, password) {
  try {
    const n8nUrl = process.env.N8N_URL || "http://localhost:5678";
    const res = await axios.post(`${n8nUrl}/rest/login`, {
      emailOrLdapLoginId: email,
      password: password,
    });

    const token = res.data.csrfToken;
    const cookie = res.headers["set-cookie"][0];

    console.log("✅ Logged in successfully");
    return { token, cookie };
  } catch (err) {
    console.error("❌ Login failed:", err.response?.data || err.message);
    throw err;
  }
}
