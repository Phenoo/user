import { type NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/server/convex-auth";

export async function GET(request: NextRequest) {
  if (!(await getAuthenticatedUser())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.redirect(
    new URL(
      "/api/integrations/google/connect?integration=calendar",
      request.url
    )
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Use the server-side Google integration OAuth flow" },
    { status: 405, headers: { Allow: "GET" } }
  );
}
