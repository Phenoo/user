import { type NextRequest, NextResponse } from "next/server"
import { createGoogleMeetService } from "@/lib/google-meet"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { summary, description, startTime, endTime, attendees, accessToken } = body

    if (!accessToken) {
      return NextResponse.json({ error: "Access token is required" }, { status: 401 })
    }

    const googleMeetService = createGoogleMeetService()
    googleMeetService.setAccessToken(accessToken)

    const meeting = await googleMeetService.createMeeting({
      summary,
      description,
      startTime,
      endTime,
      attendees,
    })

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error("Error creating Google Meet:", error)
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 })
  }
}
