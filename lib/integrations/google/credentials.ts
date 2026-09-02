import "server-only";

import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { NextRequest, NextResponse } from "next/server";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { createGoogleMeetService } from "@/lib/google-meet";
import {
  decryptGoogleCredentials,
  encryptGoogleCredentials,
  type GoogleCredentialSecrets,
} from "./crypto";
import {
  getRequiredGoogleScopes,
  hasGoogleScopes,
  type GoogleIntegrationType,
} from "./scopes";
import { GoogleAuthError } from "./tokens";

interface GoogleAuthentication {
  token: string;
  user: {
    _id: Id<"users">;
    email: string;
  };
}

interface GoogleTokenInfo {
  scope?: string;
  email?: string;
  expires_in?: string;
}

export interface ResolvedGoogleCredentials extends GoogleCredentialSecrets {
  accessToken: string;
  scopes: string[];
  email?: string;
  expiresAt: number;
}

async function inspectGoogleAccessToken(accessToken: string) {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
    { cache: "no-store" }
  );
  if (!response.ok) return null;
  return (await response.json()) as GoogleTokenInfo;
}

export async function getPersistedGoogleCredentials(
  authentication: GoogleAuthentication
) {
  const record = await fetchQuery(
    api.integrations.getGoogleCredentials,
    { userId: authentication.user._id },
    { token: authentication.token }
  );

  if (!record) return null;

  try {
    return {
      record,
      credentials: decryptGoogleCredentials(record.encryptedCredentials),
    };
  } catch (error) {
    console.error("[GoogleCredentials] Stored credentials could not be decrypted:", error);
    throw new GoogleAuthError(
      "Stored Google credentials are unavailable. Please reconnect Google.",
      "REVOKED"
    );
  }
}

export async function persistGoogleCredentials(
  authentication: GoogleAuthentication,
  credentials: GoogleCredentialSecrets,
  metadata: { scopes: string[]; email?: string; expiresAt?: number }
) {
  await fetchMutation(
    api.integrations.upsertGoogleCredentials,
    {
      userId: authentication.user._id,
      encryptedCredentials: encryptGoogleCredentials(credentials),
      scopes: metadata.scopes,
      email: metadata.email,
      expiresAt: metadata.expiresAt,
    },
    { token: authentication.token }
  );
}

async function canMigrateLegacyCookies(
  authentication: GoogleAuthentication,
  integration: GoogleIntegrationType | undefined,
  tokenEmail: string | undefined
) {
  if (!tokenEmail) return false;
  if (tokenEmail.toLowerCase() === authentication.user.email.toLowerCase()) {
    return true;
  }

  const providers = integration
    ? ([`google-${integration}`] as const)
    : (["google-classroom", "google-drive", "google-calendar"] as const);
  const accounts = await Promise.all(
    providers.map((provider) =>
      fetchQuery(
        api.integrations.getConnectedAccount,
        { userId: authentication.user._id, provider },
        { token: authentication.token }
      )
    )
  );

  return accounts.some(
    (account) =>
      account?.status === "connected" &&
      account.email?.toLowerCase() === tokenEmail.toLowerCase()
  );
}

export async function resolveGoogleCredentials(
  request: NextRequest,
  authentication: GoogleAuthentication,
  integration?: GoogleIntegrationType
): Promise<ResolvedGoogleCredentials> {
  const persisted = await getPersistedGoogleCredentials(authentication);
  const cookieAccessToken = request.cookies.get("google_meet_token")?.value;
  const cookieRefreshToken = request.cookies.get(
    "google_meet_refresh_token"
  )?.value;
  let accessToken = persisted?.credentials.accessToken;
  let refreshToken = persisted?.credentials.refreshToken;
  let migratedFromCookies = false;

  if (!persisted && (cookieAccessToken || cookieRefreshToken)) {
    accessToken = cookieAccessToken;
    refreshToken = cookieRefreshToken;
    migratedFromCookies = true;
  }

  let tokenInfo = accessToken
    ? await inspectGoogleAccessToken(accessToken)
    : null;
  let refreshed = false;

  if (!tokenInfo && refreshToken) {
    try {
      const refreshedTokens = await createGoogleMeetService().refreshAccessToken(
        refreshToken
      );
      accessToken = refreshedTokens.accessToken;
      tokenInfo = await inspectGoogleAccessToken(accessToken);
      refreshed = true;
    } catch (error) {
      console.warn("[GoogleCredentials] Google token refresh failed:", error);
      throw new GoogleAuthError(
        "Google authorization expired or was revoked. Please reconnect Google.",
        "REVOKED"
      );
    }
  }

  if (!accessToken || !tokenInfo) {
    throw new GoogleAuthError("Google account is not connected", "NOT_CONNECTED");
  }

  if (
    migratedFromCookies &&
    !(await canMigrateLegacyCookies(
      authentication,
      integration,
      tokenInfo.email
    ))
  ) {
    throw new GoogleAuthError(
      "Google connection ownership could not be verified. Please reconnect Google.",
      "REVOKED"
    );
  }

  const scopes = tokenInfo.scope?.split(" ").filter(Boolean) ?? [];
  if (
    integration &&
    !hasGoogleScopes(scopes, getRequiredGoogleScopes(integration))
  ) {
    throw new GoogleAuthError(
      `Google ${integration} permissions are incomplete. Please reconnect ${integration}.`,
      "INSUFFICIENT_SCOPE"
    );
  }

  const expiresIn = Number(tokenInfo.expires_in);
  const expiresAt =
    Number.isFinite(expiresIn) && expiresIn > 0
      ? Date.now() + expiresIn * 1000
      : Date.now() + 60 * 60 * 1000;
  const storedScopes = persisted?.record.scopes ?? [];
  const metadataChanged =
    storedScopes.length !== scopes.length ||
    storedScopes.some((scope) => !scopes.includes(scope)) ||
    persisted?.record.email !== tokenInfo.email;

  if (!persisted || refreshed || migratedFromCookies || metadataChanged) {
    await persistGoogleCredentials(
      authentication,
      { accessToken, refreshToken },
      { scopes, email: tokenInfo.email, expiresAt }
    );
  }

  return {
    accessToken,
    refreshToken,
    scopes,
    email: tokenInfo.email,
    expiresAt,
  };
}

export function setGoogleCredentialCookies(
  response: NextResponse,
  credentials: ResolvedGoogleCredentials
) {
  response.cookies.set("google_meet_token", credentials.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.max(
      60,
      Math.floor((credentials.expiresAt - Date.now()) / 1000)
    ),
    path: "/",
  });

  if (credentials.refreshToken) {
    response.cookies.set(
      "google_meet_refresh_token",
      credentials.refreshToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      }
    );
  }
}
