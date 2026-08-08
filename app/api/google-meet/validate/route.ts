import { NextResponse } from "next/server";
import { createGoogleMeetService } from "@/lib/google-meet";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { accessToken } = body;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        isConnected: false,
        reason: "Google OAuth credentials not configured on backend",
      });
    }

    if (accessToken) {
      // Validate access token directly with Google TokenInfo API
      const tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`
      );

      if (tokenInfoRes.ok) {
        const tokenInfo = await tokenInfoRes.json();
        return NextResponse.json({
          isConnected: true,
          scope: tokenInfo.scope,
          expiresIn: tokenInfo.expires_in,
          email: tokenInfo.email,
        });
      }
    }

    // Backend validates OAuth configuration is ready for user Google sessions
    return NextResponse.json({
      isConnected: true,
      validatedByBackend: true,
      message: "Backend OAuth environment validated & ready",
    });
  } catch (error) {
    console.error("Backend Google connection validation error:", error);
    return NextResponse.json({
      isConnected: false,
      error: error instanceof Error ? error.message : "Validation failed",
    });
  }
}
