import { type NextRequest, NextResponse } from "next/server";
import { verifyOAuthState } from "@/lib/integrations/google/state";
import { createGoogleMeetService, getGoogleIntegrationRedirectUri } from "@/lib/google-meet";
import { getRequiredGoogleScopes, hasGoogleScopes } from "@/lib/integrations/google/scopes";
import { getAuthenticatedUser } from "@/lib/server/convex-auth";
import {
  getPersistedGoogleCredentials,
  persistGoogleCredentials,
} from "@/lib/integrations/google/credentials";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const RELAY_PATH = "/google-callback";
const OAUTH_CALLBACK_PARAMS = [
  "code",
  "state",
  "error",
  "error_description",
  "error_uri",
] as const;

function redirectToSameOriginRelay(
  request: NextRequest,
  searchParams: URLSearchParams
) {
  const relayUrl = new URL(RELAY_PATH, request.url);

  for (const parameter of OAUTH_CALLBACK_PARAMS) {
    const value = searchParams.get(parameter);
    if (value) {
      relayUrl.searchParams.set(parameter, value);
    }
  }

  // A 303 makes Google form_post callbacks and direct browser requests load
  // the relay page with GET before the app submits the callback same-origin.
  return NextResponse.redirect(relayUrl, 303);
}

async function handleGoogleCallback(
  request: NextRequest,
  searchParams: URLSearchParams
) {
  const requestOrigin = new URL(request.url).origin;
  const appUrl = requestOrigin;

  try {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const stateParam = searchParams.get("state");

    if (error) {
      console.warn("[GoogleCallback] User declined authorization or Google returned error:", error);
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=${encodeURIComponent(error)}`,
        303
      );
    }

    if (!code || !stateParam) {
      console.error("[GoogleCallback] Missing authorization code or state", {
        hasCode: Boolean(code),
        hasState: Boolean(stateParam),
        error,
        responseKeys: Array.from(searchParams.keys()).sort(),
      });
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=invalid_callback_request`,
        303
      );
    }

    // 1. Validate state signature & CSRF cookie
    const stateData = verifyOAuthState(stateParam);
    const storedNonce = request.cookies.get("google_oauth_nonce")?.value;

    if (!stateData || !storedNonce || stateData.nonce !== storedNonce) {
      console.error("[GoogleCallback] Invalid state or CSRF mismatch");
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=csrf_validation_failed`,
        303
      );
    }

    const authentication = await getAuthenticatedUser();
    if (!authentication || authentication.user._id !== stateData.userId) {
      console.error("[GoogleCallback] OAuth user does not match the active session");
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=oauth_user_mismatch`,
        303
      );
    }

    const { integration } = stateData;

    // 2. Exchange authorization code server-side
    const service = createGoogleMeetService({
      redirectUri: getGoogleIntegrationRedirectUri(new URL(request.url).origin),
    });
    const tokenDetails = await service.exchangeCodeForTokenDetails(code);

    // 3. Inspect granted scopes from Google TokenInfo
    let grantedScopes: string[] = [];
    let accountEmail: string | undefined;
    try {
      const tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${tokenDetails.accessToken}`
      );
      if (tokenInfoRes.ok) {
        const tokenInfo = await tokenInfoRes.json();
        if (tokenInfo.scope) {
          grantedScopes = tokenInfo.scope.split(" ");
        }
        if (typeof tokenInfo.email === "string") {
          accountEmail = tokenInfo.email;
        }
      }
    } catch (infoErr) {
      console.warn("[GoogleCallback] Could not inspect granted scopes:", infoErr);
    }

    if (!hasGoogleScopes(grantedScopes, getRequiredGoogleScopes(integration))) {
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=insufficient_google_permissions&integration=${integration}`,
        303
      );
    }

    // 4. Preserve the durable refresh token when incremental authorization
    // returns only a new access token.
    let existingRefreshToken: string | undefined;
    try {
      existingRefreshToken = (
        await getPersistedGoogleCredentials(authentication)
      )?.credentials.refreshToken;
    } catch (error) {
      console.warn(
        "[GoogleCallback] Existing credentials could not be reused; replacing them:",
        error
      );
    }
    const finalRefreshToken = tokenDetails.refreshToken || existingRefreshToken;

    await persistGoogleCredentials(
      authentication,
      {
        accessToken: tokenDetails.accessToken,
        refreshToken: finalRefreshToken,
      },
      {
        scopes: grantedScopes,
        email: accountEmail,
        expiresAt: tokenDetails.expiresAt,
      }
    );

    const provider =
      integration === "classroom"
        ? "google-classroom"
        : integration === "drive"
          ? "google-drive"
          : "google-calendar";
    await fetchMutation(
      api.integrations.upsertConnectedAccount,
      {
        userId: authentication.user._id,
        provider,
        email: accountEmail,
        scopes: grantedScopes,
        status: "connected",
      },
      { token: authentication.token }
    );

    // 5. Redirect after durable credentials and connection metadata are saved.
    const redirectUrl = `${appUrl}/dashboard?connected=${integration}&status=success`;
    const response = NextResponse.redirect(redirectUrl, 303);

    // 6. Store tokens in server-only cookies, never in client-readable data.
    response.cookies.set("google_meet_token", tokenDetails.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenDetails.expiresIn || 3600,
      path: "/",
    });

    if (finalRefreshToken) {
      response.cookies.set("google_meet_refresh_token", finalRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    }

    // Clear state nonce cookie
    response.cookies.delete("google_oauth_nonce");

    return response;
  } catch (err: unknown) {
    console.error("[GoogleCallback] Unhandled error during OAuth callback:", err);
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=callback_processing_error`,
      303
    );
  }
}

export async function GET(request: NextRequest) {
  return redirectToSameOriginRelay(request, new URL(request.url).searchParams);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const searchParams = new URLSearchParams();
  const isSameOriginRelay = formData.get("oauth_relay") === "1";

  for (const [key, value] of formData.entries()) {
    if (key !== "oauth_relay" && typeof value === "string") {
      searchParams.set(key, value);
    }
  }

  // Google may still use form_post for an older cached authorization request.
  // Relay that request first so the callback processing happens same-origin.
  if (!isSameOriginRelay) {
    return redirectToSameOriginRelay(request, searchParams);
  }

  return handleGoogleCallback(request, searchParams);
}
