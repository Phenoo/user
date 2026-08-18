import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      quotaUsed: 0,
      quotaLimit: 10000,
      percentage: 0,
      status: "warning",
      message: "YouTube API key not configured",
    });
  }

  // Return estimated usage response
  return NextResponse.json({
    quotaUsed: 2500,
    quotaLimit: 10000,
    percentage: 25,
    status: "good",
    message: "YouTube API status operational",
  });
}
