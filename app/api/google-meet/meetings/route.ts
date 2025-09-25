import { type NextRequest, NextResponse } from "next/server"
import { createGoogleMeetService } from "@/lib/google-meet"

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!accessToken) {
      return NextResponse.json({ error: "Access token is required" }, { status: 401 })
    }

    const googleMeetService = createGoogleMeetService()
    googleMeetService.setAccessToken(accessToken)

    const meetings = await googleMeetService.getUpcomingMeetings()

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error("Error fetching meetings:", error)
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 })
  }
}
