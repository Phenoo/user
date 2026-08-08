import { type NextRequest, NextResponse } from "next/server";
import { verifyOAuthState } from "@/lib/integrations/google/state";
import { createGoogleMeetService } from "@/lib/google-meet";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const stateParam = searchParams.get("state");

    if (error) {
      console.warn("[GoogleCallback] User declined authorization or Google returned error:", error);
      return NextResponse.redirect(
        `${appUrl}/dashboard/settings?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !stateParam) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/settings?error=invalid_callback_request`
      );
    }

    // 1. Validate state signature & CSRF cookie
    const stateData = verifyOAuthState(stateParam);
    const storedNonce = request.cookies.get("google_oauth_nonce")?.value;

    if (!stateData || !storedNonce || stateData.nonce !== storedNonce) {
      console.error("[GoogleCallback] Invalid state or CSRF mismatch");
      return NextResponse.redirect(
        `${appUrl}/dashboard/settings?error=csrf_validation_failed`
      );
    }

    const { integration } = stateData;

    // 2. Exchange authorization code server-side
    const service = createGoogleMeetService();
    const tokenDetails = await service.exchangeCodeForTokenDetails(code);

    // 3. Inspect granted scopes from Google TokenInfo
    let grantedScopes: string[] = [];
    try {
      const tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${tokenDetails.accessToken}`
      );
      if (tokenInfoRes.ok) {
        const tokenInfo = await tokenInfoRes.json();
        if (tokenInfo.scope) {
          grantedScopes = tokenInfo.scope.split(" ");
        }
      }
    } catch (infoErr) {
      console.warn("[GoogleCallback] Could not inspect granted scopes:", infoErr);
    }

    // 4. Preserve existing refresh token if Google did not return a new one
    const existingRefreshToken = request.cookies.get("google_meet_refresh_token")?.value;
    const finalRefreshToken = tokenDetails.refreshToken || existingRefreshToken;

    // 5. Build response redirect back to settings
    const redirectUrl = `${appUrl}/dashboard/settings?connected=${integration}&status=success`;
    const response = NextResponse.redirect(redirectUrl);

    // 6. Store tokens securely in server httpOnly cookies
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
      })
    }

    // Clear state nonce cookie
    response.cookies.delete("google_oauth_nonce");

    return response;
  } catch (err: any) {
    console.error("[GoogleCallback] Unhandled error during OAuth callback:", err);
    return NextResponse.redirect(
      `${appUrl}/dashboard/settings?error=callback_processing_error`
    );
  }
}
