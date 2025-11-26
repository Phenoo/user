import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  // Check for common issues
  const issues = [];

  if (!clientId) {
    issues.push("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
  } else {
    if (!clientId.endsWith(".apps.googleusercontent.com")) {
      issues.push("Client ID should end with .apps.googleusercontent.com");
    }
    if (clientId.includes(" ")) {
      issues.push("Client ID contains spaces - remove any whitespace");
    }
    if (clientId.startsWith('"') || clientId.startsWith("'")) {
      issues.push("Client ID has quotes - remove quotes from .env.local");
    }
  }

  if (!redirectUri) {
    issues.push("NEXT_PUBLIC_GOOGLE_REDIRECT_URI is not set");
  } else {
    if (redirectUri.includes(" ")) {
      issues.push("Redirect URI contains spaces - remove any whitespace");
    }
    if (redirectUri.startsWith('"') || redirectUri.startsWith("'")) {
      issues.push("Redirect URI has quotes - remove quotes from .env.local");
    }
    if (!redirectUri.startsWith("http://") && !redirectUri.startsWith("https://")) {
      issues.push("Redirect URI must start with http:// or https://");
    }
  }

  // Build the actual URL that will be generated
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events"
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.json({
    status: issues.length === 0 ? "OK" : "ISSUES_FOUND",
    issues: issues.length > 0 ? issues : ["No issues detected"],
    config: {
      clientId: clientId ? `${clientId.substring(0, 20)}...` : "NOT SET",
      clientIdLength: clientId.length,
      clientIdEndsCorrectly: clientId.endsWith(".apps.googleusercontent.com"),
      redirectUri: redirectUri || "NOT SET",
      appUrl: appUrl || "NOT SET",
    },
    generatedAuthUrl: authUrl,
    instructions: [
      "1. Check if your Client ID ends with .apps.googleusercontent.com",
      "2. Verify Redirect URI matches exactly what's in Google Cloud Console",
      "3. Make sure there are no quotes or spaces in your .env.local values",
      "4. Restart your dev server after changing .env.local",
      "5. Copy the generatedAuthUrl and try it directly in your browser",
    ],
  });
}



