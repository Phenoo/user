import { type NextRequest, NextResponse } from "next/server"
import { createGoogleMeetService } from "@/lib/google-meet"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=${encodeURIComponent(error)}`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=no_code`
      )
    }

    const googleMeetService = createGoogleMeetService()
    const accessToken = await googleMeetService.exchangeCodeForToken(code)

    // Redirect back to dashboard with the access token
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?google_token=${encodeURIComponent(accessToken)}`
    )
  } catch (error) {
    console.error("Error in Google Meet callback:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=callback_error`
    )
  }
}
