import { type NextRequest, NextResponse } from "next/server";
import { createGoogleMeetService } from "@/lib/google-meet";
import { getValidGoogleAccessToken, GoogleAuthError } from "@/lib/integrations/google/tokens";

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("google_meet_token")?.value;
    const refreshToken = request.cookies.get("google_meet_refresh_token")?.value;

    const tokenResult = await getValidGoogleAccessToken(
      {
        accessToken,
        refreshToken,
        expiresAt: accessToken ? Date.now() + 1800000 : 0,
        scopes: [
          "https://www.googleapis.com/auth/classroom.courses.readonly",
          "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
          "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
        ],
        status: "connected",
      },
      "classroom"
    );

    const service = createGoogleMeetService();
    service.setAccessToken(tokenResult.accessToken);

    // 1. Fetch active Google Classroom courses
    const courses = await service.getClassroomCourses();
    const importedData: Array<{
      id: string;
      name: string;
      section?: string;
      courseWorkCount: number;
    }> = [];

    // 2. Fetch student coursework per course
    for (const course of courses) {
      let courseWork: any[] = [];
      try {
        courseWork = await service.getClassroomCourseWork(course.id);
      } catch (cwErr) {
        console.warn(`[ClassroomSync] Could not fetch coursework for course ${course.id}:`, cwErr);
      }

      importedData.push({
        id: course.id,
        name: course.name,
        section: course.section,
        courseWorkCount: courseWork.length,
      });
    }

    const response = NextResponse.json({
      success: true,
      message: `Successfully synced ${courses.length} courses from Google Classroom.`,
      courses: importedData,
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

    console.error("[ClassroomSync] Error syncing Google Classroom:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to sync Google Classroom" },
      { status: 500 }
    );
  }
}
