import crypto from "crypto";
import { GoogleIntegrationType } from "./scopes";

function getStateSecret() {
  const secret =
    process.env.GOOGLE_OAUTH_STATE_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) {
    throw new Error("Google OAuth state secret is not configured");
  }
  return secret;
}

export function signOAuthState(data: {
  integration: GoogleIntegrationType;
  nonce: string;
  timestamp: number;
  userId: string;
}): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const hmac = crypto.createHmac("sha256", getStateSecret()).update(payload).digest("base64url");
  return `${payload}.${hmac}`;
}

export function verifyOAuthState(stateString: string): {
  integration: GoogleIntegrationType;
  nonce: string;
  timestamp: number;
  userId: string;
} | null {
  try {
    const [payload, hmac] = stateString.split(".");
    if (!payload || !hmac) return null;

    const expectedHmac = crypto.createHmac("sha256", getStateSecret()).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return null;
    }

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const isValidIntegration = ["classroom", "drive", "calendar"].includes(
      data.integration
    );
    const age = Date.now() - data.timestamp;
    if (
      !isValidIntegration ||
      typeof data.nonce !== "string" ||
      !data.nonce ||
      typeof data.userId !== "string" ||
      !data.userId ||
      !Number.isFinite(age) ||
      age < 0 ||
      age > 15 * 60 * 1000
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
