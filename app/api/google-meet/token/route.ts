import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("google_meet_token")?.value

  if (!token) {
    return NextResponse.json({ connected: false, token: null })
  }

  return NextResponse.json({ connected: true, token })
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })

  response.cookies.set("google_meet_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  return response
}
