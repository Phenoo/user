import { type NextRequest, NextResponse } from "next/server";
import { createGoogleMeetService } from "@/lib/google-meet";

export async function GET(request: NextRequest) {
  try {
    let token = request.cookies.get("google_meet_token")?.value;
    const refreshToken = request.cookies.get("google_meet_refresh_token")?.value;

    const googleMeetService = createGoogleMeetService();

    if (!token && refreshToken) {
      try {
        const refreshed = await googleMeetService.refreshAccessToken(refreshToken);
        token = refreshed.accessToken;
      } catch (err) {
        console.warn("Failed auto refresh for Drive:", err);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please connect your Google account." },
        { status: 401 }
      );
    }

    googleMeetService.setAccessToken(token);
    const files = await googleMeetService.getDriveFiles(30);

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("Google Drive API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to list Google Drive files" },
      { status: 500 }
    );
  }
}
