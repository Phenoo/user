import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getRequiredGoogleScopes, GoogleIntegrationType } from "@/lib/integrations/google/scopes";
import { signOAuthState } from "@/lib/integrations/google/state";
import { getGoogleIntegrationRedirectUri } from "@/lib/google-meet";
import { getAuthenticatedUser } from "@/lib/server/convex-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationParam = searchParams.get("integration");
    const authentication = await getAuthenticatedUser();
    if (!authentication) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

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
      userId: authentication.user._id,
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
      // Google posts the authorization response to the callback. The callback
      // relays it through a same-origin page before reading the app session.
      response_mode: "form_post",
      scope: scopesToRequest.join(" "),
      access_type: "offline",
      include_granted_scopes: "true",
      prompt: "consent",
      state,
    });

    console.info("[GoogleConnect] Starting OAuth", {
      integration,
      responseMode: "form_post",
      callbackHost: new URL(redirectUri).host,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Set CSRF verification cookie
    const response = NextResponse.redirect(authUrl);
    response.cookies.set("google_oauth_nonce", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 mins
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("[GoogleConnect] Error generating connect URL:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to initiate Google OAuth flow",
      },
      { status: 500 }
    );
  }
}
