import { type NextRequest, NextResponse } from "next/server";
import { createGoogleMeetService } from "@/lib/google-meet";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("google_meet_token")?.value;
    const refreshToken = req.cookies.get("google_meet_refresh_token")?.value;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        connected: false,
        reason: "Google OAuth credentials not configured on backend",
      });
    }

    let activeToken = token;
    let newExpiresIn = 3600;

    // If access token is missing or expired, attempt refresh using stored refresh token
    if (!activeToken && refreshToken) {
      try {
        const service = createGoogleMeetService();
        const refreshData = await service.refreshAccessToken(refreshToken);
        activeToken = refreshData.accessToken;
        newExpiresIn = refreshData.expiresIn;
      } catch (refErr) {
        console.warn("[Validate] Refresh token exchange error:", refErr);
      }
    }

    if (activeToken) {
      try {
        const tokenInfoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${activeToken}`
        );
        if (tokenInfoRes.ok) {
          const tokenInfo = await tokenInfoRes.json();
          const scopes: string[] = tokenInfo.scope ? tokenInfo.scope.split(" ") : [];

          const hasClassroom = scopes.some((s: string) => s.includes("classroom"));
          const hasDrive = scopes.some((s: string) => s.includes("drive"));
          const hasCalendar = scopes.some((s: string) => s.includes("calendar"));

          const res = NextResponse.json({
            connected: true,
            hasClassroom,
            hasDrive,
            hasCalendar,
            email: tokenInfo.email,
            scopes,
          });

          // Keep access token cookie updated
          if (!token && activeToken) {
            res.cookies.set("google_meet_token", activeToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: newExpiresIn,
              path: "/",
            });
          }

          return res;
        }
      } catch (err) {
        console.warn("[Validate] Token check error:", err);
      }
    }

    if (refreshToken) {
      return NextResponse.json({
        connected: true,
        hasClassroom: true,
        hasDrive: true,
        hasCalendar: true,
        hasRefreshToken: true,
      });
    }

    return NextResponse.json({
      connected: false,
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : "Validation failed",
    });
  }
}

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
      const tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`
      );

      if (tokenInfoRes.ok) {
        const tokenInfo = await tokenInfoRes.json();
        const scopes: string[] = tokenInfo.scope ? tokenInfo.scope.split(" ") : [];

        return NextResponse.json({
          isConnected: true,
          scope: tokenInfo.scope,
          hasClassroom: scopes.some((s: string) => s.includes("classroom")),
          hasDrive: scopes.some((s: string) => s.includes("drive")),
          hasCalendar: scopes.some((s: string) => s.includes("calendar")),
          expiresIn: tokenInfo.expires_in,
          email: tokenInfo.email,
        });
      }
    }

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
