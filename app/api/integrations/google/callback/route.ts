import { type NextRequest, NextResponse } from "next/server";
import { verifyOAuthState } from "@/lib/integrations/google/state";
import { createGoogleMeetService, getGoogleIntegrationRedirectUri } from "@/lib/google-meet";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
        `${appUrl}/dashboard?error=${encodeURIComponent(error)}`
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
        `${appUrl}/dashboard?error=invalid_callback_request`
      );
    }

    // 1. Validate state signature & CSRF cookie
    const stateData = verifyOAuthState(stateParam);
    const storedNonce = request.cookies.get("google_oauth_nonce")?.value;

    if (!stateData || !storedNonce || stateData.nonce !== storedNonce) {
      console.error("[GoogleCallback] Invalid state or CSRF mismatch");
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=csrf_validation_failed`
      );
    }

    const { integration, userId } = stateData;

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
        if (tokenInfo.email) {
          accountEmail = tokenInfo.email;
        }
      }
    } catch (infoErr) {
      console.warn("[GoogleCallback] Could not inspect granted scopes:", infoErr);
    }

    // 4. Preserve existing refresh token if Google did not return a new one
    const existingRefreshToken = request.cookies.get("google_meet_refresh_token")?.value;
    const finalRefreshToken = tokenDetails.refreshToken || existingRefreshToken;

    // 5. Save connected account to Convex database
    if (userId) {
      try {
        const providerName: "google-calendar" | "google-drive" | "google-classroom" =
          integration === "classroom"
            ? "google-classroom"
            : integration === "drive"
            ? "google-drive"
            : "google-calendar";

        await fetchMutation(api.integrations.upsertConnectedAccount, {
          userId: userId as Id<"users">,
          provider: providerName,
          email: accountEmail,
          scopes: grantedScopes,
          status: "connected",
          accessToken: tokenDetails.accessToken,
          refreshToken: finalRefreshToken,
          expiresAt: tokenDetails.expiresAt,
        });
      } catch (convexErr) {
        console.error("[GoogleCallback] Error saving connected account to Convex:", convexErr);
      }
    }

    // 6. Build response redirect back to dashboard
    const redirectUrl = `${appUrl}/dashboard?connected=${integration}&status=success`;
    const response = NextResponse.redirect(redirectUrl);

    // 7. Store tokens securely in server httpOnly cookies
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
  } catch (err: any) {
    console.error("[GoogleCallback] Unhandled error during OAuth callback:", err);
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=callback_processing_error`
    );
  }
}

export async function GET(request: NextRequest) {
  return handleGoogleCallback(request, new URL(request.url).searchParams);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const searchParams = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      searchParams.set(key, value);
    }
  }

  return handleGoogleCallback(request, searchParams);
}
