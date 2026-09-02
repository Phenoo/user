import { type NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import {
  getPersistedGoogleCredentials,
  resolveGoogleCredentials,
  setGoogleCredentialCookies,
} from "@/lib/integrations/google/credentials";
import type { GoogleIntegrationType } from "@/lib/integrations/google/scopes";
import { getAuthenticatedUser } from "@/lib/server/convex-auth";

function getRequestedIntegration(request: NextRequest): GoogleIntegrationType | null {
  const integration = request.nextUrl.searchParams.get("integration") || "drive";
  return ["classroom", "drive", "calendar"].includes(integration)
    ? (integration as GoogleIntegrationType)
    : null;
}

export async function GET(request: NextRequest) {
  const authentication = await getAuthenticatedUser();
  if (!authentication) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const integration = getRequestedIntegration(request);
  if (!integration) {
    return NextResponse.json({ error: "Invalid Google integration" }, { status: 400 });
  }

  try {
    const credentials = await resolveGoogleCredentials(
      request,
      authentication,
      integration
    );
    // Google Picker requires browser access to the OAuth token. The route is
    // authenticated, validates the Drive scope, and never permits caching.
    const response = NextResponse.json({
      connected: true,
      accessToken: credentials.accessToken,
      token: credentials.accessToken,
    });
    response.headers.set("Cache-Control", "no-store, private");
    setGoogleCredentialCookies(response, credentials);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Google is not connected",
      },
      { status: 403 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authentication = await getAuthenticatedUser();
  if (!authentication) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let tokenToRevoke = request.cookies.get("google_meet_refresh_token")?.value;
  try {
    const persisted = await getPersistedGoogleCredentials(authentication);
    tokenToRevoke =
      persisted?.credentials.refreshToken ||
      persisted?.credentials.accessToken ||
      tokenToRevoke;
  } catch (error) {
    console.warn("[GoogleToken] Stored credential cleanup continued:", error);
  }

  if (tokenToRevoke) {
    try {
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: tokenToRevoke }),
        cache: "no-store",
      });
    } catch (error) {
      console.warn("[GoogleToken] Could not revoke Google token:", error);
    }
  }

  await Promise.all([
    fetchMutation(
      api.integrations.clearGoogleCredentials,
      { userId: authentication.user._id },
      { token: authentication.token }
    ),
    ...(["google-classroom", "google-drive", "google-calendar"] as const).map(
      (provider) =>
        fetchMutation(
          api.integrations.upsertConnectedAccount,
          {
            userId: authentication.user._id,
            provider,
            scopes: [],
            status: "disconnected",
          },
          { token: authentication.token }
        )
    ),
  ]);

  const response = NextResponse.json({ success: true });
  response.cookies.delete("google_meet_token");
  response.cookies.delete("google_meet_refresh_token");
  response.cookies.delete("google_oauth_nonce");
  return response;
}
