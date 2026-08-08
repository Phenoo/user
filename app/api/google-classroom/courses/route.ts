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
        console.warn("Failed auto refresh for Classroom:", err);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please connect your Google account." },
        { status: 401 }
      );
    }

    googleMeetService.setAccessToken(token);
    const courses = await googleMeetService.getClassroomCourses();

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("Google Classroom API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to list Google Classroom courses" },
      { status: 500 }
    );
  }
}
