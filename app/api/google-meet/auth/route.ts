import { type NextRequest, NextResponse } from "next/server"
import { createGoogleMeetService } from "@/lib/google-meet"

export async function GET() {
  try {
    const googleMeetService = createGoogleMeetService()
    const authUrl = googleMeetService.getAuthUrl()

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Error generating auth URL:", error)
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 })
    }

    const googleMeetService = createGoogleMeetService()
    const accessToken = await googleMeetService.exchangeCodeForToken(code)

    return NextResponse.json({ accessToken })
  } catch (error) {
    console.error("Error exchanging code for token:", error)
    return NextResponse.json({ error: "Failed to exchange authorization code" }, { status: 500 })
  }
}
