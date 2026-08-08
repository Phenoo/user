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

    // Validate access token from body or cookie
    let token = accessToken || request.cookies.get("google_meet_token")?.value;
    const refreshToken = request.cookies.get("google_meet_refresh_token")?.value;

    const googleMeetService = createGoogleMeetService();

    // If access token is missing but refresh token exists, refresh automatically
    if (!token && refreshToken) {
      try {
        const refreshed = await googleMeetService.refreshAccessToken(refreshToken);
        token = refreshed.accessToken;
      } catch (refreshErr) {
        console.warn("Failed to refresh access token using offline refresh token:", refreshErr);
      }
    }

    if (!token) {
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

    googleMeetService.setAccessToken(token);

    let meeting;
    try {
      meeting = await googleMeetService.createMeeting({
        summary,
        description,
        startTime,
        endTime,
        attendees,
      });
    } catch (meetingErr) {
      // If original token expired mid-session and refresh token is available, attempt auto-refresh retry
      if (refreshToken) {
        try {
          const refreshed = await googleMeetService.refreshAccessToken(refreshToken);
          googleMeetService.setAccessToken(refreshed.accessToken);
          meeting = await googleMeetService.createMeeting({
            summary,
            description,
            startTime,
            endTime,
            attendees,
          });
        } catch (retryErr) {
          throw meetingErr;
        }
      } else {
        throw meetingErr;
      }
    }

    return successResponse({ meeting }, "Google Meet created successfully");
  } catch (error) {
    console.error("Error creating Google Meet:", error);
    return handleApiError(error, "Failed to create meeting");
  }
}
