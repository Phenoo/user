import { createGoogleMeetService } from "@/lib/google-meet";
import { getRequiredGoogleScopes, hasGoogleScopes, GoogleIntegrationType } from "./scopes";

export interface GoogleTokenResult {
  accessToken: string;
  grantedScopes: string[];
  expiresAt: number;
  refreshToken?: string;
}

export class GoogleAuthError extends Error {
  code: "INVALID_GRANT" | "REVOKED" | "INSUFFICIENT_SCOPE" | "EXPIRED" | "NOT_CONNECTED";

  constructor(
    message: string,
    code: "INVALID_GRANT" | "REVOKED" | "INSUFFICIENT_SCOPE" | "EXPIRED" | "NOT_CONNECTED"
  ) {
    super(message);
    this.name = "GoogleAuthError";
    this.code = code;
  }
}

/**
 * Validates and refreshes access token for a specific integration.
 * Performs token expiry check, scope verification, and automated background refresh using offline refresh tokens.
 */
export async function getValidGoogleAccessToken(
  account: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    scopes?: string[];
    status?: string;
  },
  integration: GoogleIntegrationType
): Promise<{ accessToken: string; updatedTokens?: { accessToken: string; expiresAt: number } }> {
  if (!account || account.status === "disconnected") {
    throw new GoogleAuthError("Google account is not connected", "NOT_CONNECTED");
  }

  const requiredScopes = getRequiredGoogleScopes(integration);
  const grantedScopes = account.scopes || [];

  if (!hasGoogleScopes(grantedScopes, requiredScopes)) {
    throw new GoogleAuthError(
      `Permission for ${integration} has not been granted yet. Please re-authorize ${integration}.`,
      "INSUFFICIENT_SCOPE"
    );
  }

  const now = Date.now();
  // Buffer of 2 minutes to prevent edge-of-expiry failures
  const isExpired = !account.accessToken || !account.expiresAt || account.expiresAt <= now + 120000;

  if (!isExpired && account.accessToken) {
    return { accessToken: account.accessToken };
  }

  if (!account.refreshToken) {
    throw new GoogleAuthError(
      "Access token is expired and no refresh token is stored. Please reconnect Google.",
      "EXPIRED"
    );
  }

  try {
    const service = createGoogleMeetService();
    const refreshed = await service.refreshAccessToken(account.refreshToken);

    return {
      accessToken: refreshed.accessToken,
      updatedTokens: {
        accessToken: refreshed.accessToken,
        expiresAt: refreshed.expiresAt,
      },
    };
  } catch (err: any) {
    console.error(`[GoogleTokens] Token refresh failed for ${integration}:`, err);
    const message = err?.message || "";
    if (message.includes("invalid_grant") || message.includes("Token has been expired or revoked")) {
      throw new GoogleAuthError(
        "Google access revoked or refresh token expired. Reconnection required.",
        "REVOKED"
      );
    }
    throw new GoogleAuthError(message || "Failed to refresh Google token", "INVALID_GRANT");
  }
}
