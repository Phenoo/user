import { type NextRequest, NextResponse } from "next/server";

import { createGoogleMeetService } from "@/lib/google-meet";
import {
  resolveGoogleCredentials,
  setGoogleCredentialCookies,
} from "@/lib/integrations/google/credentials";
import { GoogleAuthError } from "@/lib/integrations/google/tokens";
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
      "classroom"
    );

    const googleMeetService = createGoogleMeetService();
    googleMeetService.setAccessToken(credentials.accessToken);
    const courses = await googleMeetService.getClassroomCourses();
    const response = NextResponse.json({ courses });

    setGoogleCredentialCookies(response, credentials);

    return response;
  } catch (error: unknown) {
    console.error("Google Classroom API error:", error);
    const status = error instanceof GoogleAuthError ? 403 : 500;
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to list Google Classroom courses",
      },
      { status }
    );
  }
}
