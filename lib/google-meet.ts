// Google Meet API integration utilities
export interface GoogleMeetConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleMeetRoom {
  name: string;
  meetingUri: string;
  meetingCode: string;
  createTime: string;
  endTime?: string;
}

export interface CreateMeetingRequest {
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
}

// Google Calendar API Types
interface ConferenceEntryPoint {
  entryPointType: string;
  uri?: string;
  meetingCode?: string;
  label?: string;
}

interface ConferenceData {
  entryPoints?: ConferenceEntryPoint[];
  conferenceSolution?: {
    key: {
      type: string;
    };
    name: string;
    iconUri: string;
  };
  conferenceId?: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  conferenceData?: ConferenceData;
  created: string;
  updated: string;
}

interface CalendarEventList {
  items?: CalendarEvent[];
  error?: {
    message: string;
  };
}

export class GoogleMeetService {
  private config: GoogleMeetConfig;
  private accessToken: string | null = null;

  constructor(config: GoogleMeetConfig) {
    this.config = config;
  }

  // Initialize OAuth flow
  getAuthUrl(): string {
    // Validate configuration
    if (!this.config.clientId) {
      throw new Error("Google Client ID is not configured");
    }
    if (!this.config.redirectUri) {
      throw new Error("Google Redirect URI is not configured");
    }

    // Build the auth URL with properly encoded scopes (Calendar, Drive, Classroom)
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/classroom.courses.readonly",
      "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
      "https://www.googleapis.com/auth/classroom.announcements.readonly",
    ];

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Exchange authorization code for access token and refresh token details
  async exchangeCodeForTokenDetails(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    expiresAt: number;
  }> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.config.redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to exchange code: ${data.error_description || data.error}`);
    }

    this.accessToken = data.access_token;
    const expiresIn = data.expires_in || 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn,
      expiresAt,
    };
  }

  // Exchange authorization code for access token (legacy compatibility)
  async exchangeCodeForToken(code: string): Promise<string> {
    const details = await this.exchangeCodeForTokenDetails(code);
    return details.accessToken;
  }

  // Refresh access token using a stored offline refresh token
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
    expiresAt: number;
  }> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${data.error_description || data.error}`);
    }

    this.accessToken = data.access_token;
    const expiresIn = data.expires_in || 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    return {
      accessToken: data.access_token,
      expiresIn,
      expiresAt,
    };
  }

  // Create a Google Meet meeting via Calendar API
  async createMeeting(request: CreateMeetingRequest): Promise<GoogleMeetRoom> {
    if (!this.accessToken) {
      throw new Error(
        "Not authenticated. Please call exchangeCodeForToken first."
      );
    }

    const calendarEvent = {
      summary: request.summary,
      description: request.description,
      start: {
        dateTime: request.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: request.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: request.attendees?.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    // IMPORTANT: conferenceDataVersion=1 is REQUIRED to create Google Meet links
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Google Calendar API Error:", data);
      throw new Error(
        `Failed to create meeting: ${data.error?.message || "Unknown error"}`
      );
    }

    const meetingData = data.conferenceData?.entryPoints?.find(
      (entry: ConferenceEntryPoint) => entry.entryPointType === "video"
    );

    if (!meetingData) {
      console.error("No conference data in response:", data);
      throw new Error(
        "Failed to create Google Meet link. Please check your Google Calendar API permissions."
      );
    }

    return {
      name: data.summary,
      meetingUri: meetingData?.uri || "",
      meetingCode: meetingData?.meetingCode || "",
      createTime: data.created,
      endTime: data.end?.dateTime,
    };
  }

  // Get upcoming meetings from Calendar
  async getUpcomingMeetings(): Promise<CalendarEvent[]> {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    const now = new Date().toISOString();
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=10&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    const data: CalendarEventList = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to fetch meetings: ${data.error?.message}`);
    }

    return (
      data.items?.filter((event: CalendarEvent) =>
        event.conferenceData?.entryPoints?.some(
          (entry: ConferenceEntryPoint) => entry.entryPointType === "video"
        )
      ) || []
    );
  }

  // Get files from Google Drive
  async getDriveFiles(pageSize = 20): Promise<Array<{ id: string; name: string; mimeType: string; webViewLink?: string }>> {
    if (!this.accessToken) {
      throw new Error("Not authenticated with Google");
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=files(id,name,mimeType,webViewLink,createdTime)&orderBy=modifiedTime%20desc`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to fetch Drive files: ${data.error?.message || "Unknown error"}`);
    }

    return data.files || [];
  }

  // Get courses from Google Classroom
  async getClassroomCourses(): Promise<Array<{ id: string; name: string; section?: string; descriptionHeading?: string; alternateLink?: string }>> {
    if (!this.accessToken) {
      throw new Error("Not authenticated with Google");
    }

    const response = await fetch(
      `https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to fetch Classroom courses: ${data.error?.message || "Unknown error"}`);
    }

    return data.courses || [];
  }

  // Get coursework/assignments for a Google Classroom course
  async getClassroomCourseWork(courseId: string): Promise<Array<{ id: string; title: string; description?: string; dueDate?: any; alternateLink?: string }>> {
    if (!this.accessToken) {
      throw new Error("Not authenticated with Google");
    }

    const response = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to fetch Classroom coursework: ${data.error?.message || "Unknown error"}`);
    }

    return data.courseWork || [];
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }
}

// Utility function to create a Google Meet service instance
export function createGoogleMeetService(
  overrides: Partial<GoogleMeetConfig> = {}
): GoogleMeetService {
  const config: GoogleMeetConfig = {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri:
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/google-meet/callback`,
    ...overrides,
  };

  return new GoogleMeetService(config);
}

/** Resolve the redirect used by the Google academic-integration OAuth flow. */
export function getGoogleIntegrationRedirectUri(origin?: string): string {
  const explicit = process.env.NEXT_PUBLIC_GOOGLE_INTEGRATION_REDIRECT_URI;
  if (explicit) return explicit;

  // The request origin is authoritative for this OAuth round-trip. This also
  // prevents a production NEXT_PUBLIC_APP_URL from hijacking localhost dev.
  if (origin) return `${origin.replace(/\/$/, "")}/api/integrations/google/callback`;

  const configured = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  if (configured?.includes("/api/integrations/google/callback")) return configured;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin || "http://localhost:3000";
  return `${appUrl.replace(/\/$/, "")}/api/integrations/google/callback`;
}
