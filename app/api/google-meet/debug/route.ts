import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  // Check for common formatting issues
  const warnings = [];

  if (clientId && !clientId.endsWith(".apps.googleusercontent.com")) {
    warnings.push("⚠️ Client ID should end with .apps.googleusercontent.com");
  }
  if (clientId && (clientId.includes(" ") || clientId.startsWith('"') || clientId.startsWith("'"))) {
    warnings.push("⚠️ Client ID has spaces or quotes - check your .env.local file");
  }
  if (redirectUri && (redirectUri.includes(" ") || redirectUri.startsWith('"') || redirectUri.startsWith("'"))) {
    warnings.push("⚠️ Redirect URI has spaces or quotes - check your .env.local file");
  }
  if (redirectUri && !redirectUri.startsWith("http")) {
    warnings.push("⚠️ Redirect URI must start with http:// or https://");
  }

  const envCheck = {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    hasRedirectUri: !!redirectUri,
    hasAppUrl: !!appUrl,
    clientIdLength: clientId.length,
    clientIdPreview: clientId ? `${clientId.substring(0, 20)}...` : "Not set",
    clientIdFormat: clientId.endsWith(".apps.googleusercontent.com") ? "✅ Correct" : "❌ Invalid",
    clientSecretLength: clientSecret.length,
    redirectUri: redirectUri || "Not set",
    appUrl: appUrl || "Not set",
  };

  const allSet = envCheck.hasClientId && envCheck.hasClientSecret && envCheck.hasRedirectUri && envCheck.hasAppUrl;

  return NextResponse.json({
    status: allSet && warnings.length === 0 ? "✅ All Good" : warnings.length > 0 ? "⚠️ Warnings" : "❌ Missing Variables",
    environment: envCheck,
    warnings: warnings.length > 0 ? warnings : ["No issues detected"],
    required: [
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID (must end with .apps.googleusercontent.com)",
      "GOOGLE_CLIENT_SECRET",
      "NEXT_PUBLIC_GOOGLE_REDIRECT_URI (must match Google Console exactly)",
      "NEXT_PUBLIC_APP_URL",
    ],
    tips: [
      "1. Get credentials from: https://console.cloud.google.com/apis/credentials",
      "2. Make sure there are NO quotes around values in .env.local",
      "3. Restart your dev server after changing .env.local",
      "4. Redirect URI in Google Console must match EXACTLY (including http/https)",
    ],
  });
}
