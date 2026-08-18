import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getRequiredGoogleScopes, GoogleIntegrationType } from "@/lib/integrations/google/scopes";
import { signOAuthState } from "@/lib/integrations/google/state";
import { getGoogleIntegrationRedirectUri } from "@/lib/google-meet";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationParam = searchParams.get("integration");
    const userId = searchParams.get("userId") || undefined;

    if (!integrationParam || !["classroom", "drive", "calendar"].includes(integrationParam)) {
      return NextResponse.json(
        { error: "Invalid or missing integration parameter. Must be classroom, drive, or calendar." },
        { status: 400 }
      );
    }

    const integration = integrationParam as GoogleIntegrationType;
    const requiredScopes = getRequiredGoogleScopes(integration);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = getGoogleIntegrationRedirectUri(new URL(request.url).origin);

    if (!clientId) {
      return NextResponse.json(
        { error: "Google Client ID is missing from environment variables." },
        { status: 500 }
      );
    }

    // Cryptographic CSRF state including userId
    const nonce = crypto.randomBytes(16).toString("hex");
    const state = signOAuthState({
      integration,
      nonce,
      timestamp: Date.now(),
      userId,
    });

    const scopesToRequest = [
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      ...requiredScopes,
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      // Keep the authorization code out of the browser URL and receive the
      // complete OAuth response in the callback POST body.
      response_mode: process.env.NODE_ENV === "production" ? "form_post" : "query",
      scope: scopesToRequest.join(" "),
      access_type: "offline",
      include_granted_scopes: "true",
      prompt: "consent",
      state,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Set CSRF verification cookie
    const response = NextResponse.redirect(authUrl);
    response.cookies.set("google_oauth_nonce", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Google submits the production callback cross-site via POST. Lax
      // cookies are excluded from that request, so production needs None.
      // Local development uses query mode and can safely keep Lax.
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60, // 15 mins
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[GoogleConnect] Error generating connect URL:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to initiate Google OAuth flow" },
      { status: 500 }
    );
  }
}
