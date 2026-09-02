import { type NextRequest } from "next/server";
import { createGoogleMeetService } from "@/lib/google-meet";
import {
  CommonErrors,
  successResponse,
  validateRequiredFields,
  handleApiError,
} from "@/lib/api-helpers";
import { getAuthenticatedUser } from "@/lib/server/convex-auth";
import {
  resolveGoogleCredentials,
  setGoogleCredentialCookies,
} from "@/lib/integrations/google/credentials";

export async function POST(request: NextRequest) {
  try {
    const authentication = await getAuthenticatedUser();
    if (!authentication) {
      return CommonErrors.unauthorized("Authentication required");
    }

    const body = await request.json();
    const { summary, description, startTime, endTime, attendees } = body;

    // Validate required fields
    const validationError = validateRequiredFields(body, [
      "summary",
      "startTime",
      "endTime",
    ]);
    if (validationError) {
      return validationError;
    }

    const credentials = await resolveGoogleCredentials(
      request,
      authentication,
      "calendar"
    );
    const googleMeetService = createGoogleMeetService();
    googleMeetService.setAccessToken(credentials.accessToken);
    const meeting = await googleMeetService.createMeeting({
      summary,
      description,
      startTime,
      endTime,
      attendees,
    });

    const response = successResponse(
      { meeting },
      "Google Meet created successfully"
    );
    setGoogleCredentialCookies(response, credentials);
    return response;
  } catch (error) {
    console.error("Error creating Google Meet:", error);
    return handleApiError(error, "Failed to create meeting");
  }
}
