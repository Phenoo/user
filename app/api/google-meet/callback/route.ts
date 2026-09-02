import { type NextRequest, NextResponse } from "next/server";

// The former callback did not validate OAuth state and only stored temporary
// cookies. All Google integrations now use the durable, user-bound callback.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/dashboard?error=legacy_google_callback_disabled", request.url)
  );
}
