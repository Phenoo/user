import { type NextRequest, NextResponse } from "next/server";
import { createGoogleMeetService } from "@/lib/google-meet";
import { getValidGoogleAccessToken, GoogleAuthError } from "@/lib/integrations/google/tokens";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summary, description, startTime, endTime, attendees, timeZone, sourceType, sourceId, providerEventId } = body;

    if (!summary || !startTime || !endTime) {
      return NextResponse.json(
        { error: "summary, startTime, and endTime are required fields." },
        { status: 400 }
      );
    }

    // Prevent duplicate event creation if providerEventId already exists
    if (providerEventId) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        providerEventId,
        message: "Event is already synced to Google Calendar.",
      });
    }

    const accessToken = request.cookies.get("google_meet_token")?.value;
    const refreshToken = request.cookies.get("google_meet_refresh_token")?.value;

    const tokenResult = await getValidGoogleAccessToken(
      {
        accessToken,
        refreshToken,
        expiresAt: accessToken ? Date.now() + 1800000 : 0,
        scopes: ["https://www.googleapis.com/auth/calendar.events.owned"],
        status: "connected",
      },
      "calendar"
    );

    const service = createGoogleMeetService();
    service.setAccessToken(tokenResult.accessToken);

    const meeting = await service.createMeeting({
      summary,
      description: description ? `${description}\n\n[Created via StudentApp Academic OS]` : "[Created via StudentApp Academic OS]",
      startTime,
      endTime,
      attendees,
    });

    const response = NextResponse.json({
      success: true,
      meeting,
      providerEventId: meeting.meetingCode || `cal-${Date.now()}`,
    });

    if (tokenResult.updatedTokens) {
      response.cookies.set("google_meet_token", tokenResult.updatedTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600,
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    if (error instanceof GoogleAuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "INSUFFICIENT_SCOPE" ? 403 : 401 }
      );
    }

    console.error("[CalendarEvents] Error creating Google Calendar event:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Google Calendar event" },
      { status: 500 }
    );
  }
}
