import { type NextRequest } from "next/server";
import { createGoogleMeetService } from "@/lib/google-meet";
import {
  CommonErrors,
  successResponse,
  validateRequiredFields,
  handleApiError,
} from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summary, description, startTime, endTime, attendees, accessToken } =
      body;

    // Validate access token
    if (!accessToken) {
      return CommonErrors.unauthorized("Access token is required");
    }

    // Validate required fields
    const validationError = validateRequiredFields(body, [
      "summary",
      "startTime",
      "endTime",
    ]);
    if (validationError) {
      return validationError;
    }

    const googleMeetService = createGoogleMeetService();
    googleMeetService.setAccessToken(accessToken);

    const meeting = await googleMeetService.createMeeting({
      summary,
      description,
      startTime,
      endTime,
      attendees,
    });

    return successResponse({ meeting }, "Google Meet created successfully");
  } catch (error) {
    console.error("Error creating Google Meet:", error);
    return handleApiError(error, "Failed to create meeting");
  }
}
