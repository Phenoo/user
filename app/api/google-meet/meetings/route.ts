import { type NextRequest, NextResponse } from "next/server";

import { createGoogleMeetService } from "@/lib/google-meet";
import {
  resolveGoogleCredentials,
  setGoogleCredentialCookies,
} from "@/lib/integrations/google/credentials";
import { getAuthenticatedUser } from "@/lib/server/convex-auth";

export async function GET(request: NextRequest) {
  const authentication = await getAuthenticatedUser();
  if (!authentication) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const credentials = await resolveGoogleCredentials(
      request,
      authentication,
      "calendar"
    );
    const googleMeetService = createGoogleMeetService();
    googleMeetService.setAccessToken(credentials.accessToken);
    const meetings = await googleMeetService.getUpcomingMeetings();
    const response = NextResponse.json({ meetings });
    setGoogleCredentialCookies(response, credentials);
    return response;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch meetings",
      },
      { status: 500 }
    );
  }
}
