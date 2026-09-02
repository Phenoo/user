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
      "drive"
    );
    const googleMeetService = createGoogleMeetService();
    googleMeetService.setAccessToken(credentials.accessToken);
    const files = await googleMeetService.getDriveFiles(30);
    const response = NextResponse.json({ files });
    setGoogleCredentialCookies(response, credentials);
    return response;
  } catch (error: unknown) {
    console.error("Google Drive API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list Google Drive files",
      },
      { status: 500 }
    );
  }
}
