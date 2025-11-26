import { type NextRequest } from "next/server";
import { createGoogleMeetService } from "@/lib/google-meet";
import { CommonErrors, successResponse, handleApiError, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  try {
    // Debug: Log environment variables (without exposing sensitive data)
    if (process.env.NODE_ENV === "development") {
      console.log("Google OAuth Config Check:", {
        hasClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        clientIdPrefix: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 10),
        hasRedirectUri: !!process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
        redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      });
    }

    const googleMeetService = createGoogleMeetService();
    const authUrl = googleMeetService.getAuthUrl();

    return successResponse({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to generate auth URL",
      500,
      "Check your environment variables: NEXT_PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_GOOGLE_REDIRECT_URI",
      "AUTH_URL_GENERATION_FAILED"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return CommonErrors.badRequest("Authorization code is required");
    }

    const googleMeetService = createGoogleMeetService();
    const accessToken = await googleMeetService.exchangeCodeForToken(code);

    return successResponse({ accessToken });
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return handleApiError(error, "Failed to exchange authorization code");
  }
}
