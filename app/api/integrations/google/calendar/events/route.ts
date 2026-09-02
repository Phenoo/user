import { type NextRequest, NextResponse } from "next/server";
import { createGoogleMeetService } from "@/lib/google-meet";
import { GoogleAuthError } from "@/lib/integrations/google/tokens";
import {
  resolveGoogleCredentials,
  setGoogleCredentialCookies,
} from "@/lib/integrations/google/credentials";
import { getAuthenticatedUser } from "@/lib/server/convex-auth";

export async function POST(request: NextRequest) {
  const authentication = await getAuthenticatedUser();
  if (!authentication) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { summary, description, startTime, endTime, attendees, providerEventId } = body;

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

    const credentials = await resolveGoogleCredentials(
      request,
      authentication,
      "calendar"
    );

    const service = createGoogleMeetService();
    service.setAccessToken(credentials.accessToken);

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

    setGoogleCredentialCookies(response, credentials);

    return response;
  } catch (error: unknown) {
    if (error instanceof GoogleAuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "INSUFFICIENT_SCOPE" ? 403 : 401 }
      );
    }

    console.error("[CalendarEvents] Error creating Google Calendar event:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create Google Calendar event",
      },
      { status: 500 }
    );
  }
}
