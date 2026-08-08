import crypto from "crypto";
import { GoogleIntegrationType } from "./scopes";

const STATE_SECRET = process.env.GOOGLE_CLIENT_SECRET || "studentapp-oauth-state-secret-2026";

export function signOAuthState(data: { integration: string; nonce: string; timestamp: number }): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const hmac = crypto.createHmac("sha256", STATE_SECRET).update(payload).digest("base64url");
  return `${payload}.${hmac}`;
}

export function verifyOAuthState(stateString: string): { integration: GoogleIntegrationType; nonce: string; timestamp: number } | null {
  try {
    const [payload, hmac] = stateString.split(".");
    if (!payload || !hmac) return null;

    const expectedHmac = crypto.createHmac("sha256", STATE_SECRET).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return null;
    }

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    // Expire state after 15 minutes
    if (Date.now() - data.timestamp > 15 * 60 * 1000) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
