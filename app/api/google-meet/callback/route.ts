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
    const tokenDetails = await googleMeetService.exchangeCodeForTokenDetails(code)

    // Create response with redirect
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?google_connected=true`
    )

    // Store access token in httpOnly cookie
    response.cookies.set("google_meet_token", tokenDetails.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    // Store refresh token in httpOnly cookie if present for offline access
    if (tokenDetails.refreshToken) {
      response.cookies.set("google_meet_refresh_token", tokenDetails.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      })
    }

    return response
  } catch (error) {
    console.error("Error in Google Meet callback:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=callback_error`
    )
  }
}
