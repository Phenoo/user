import { type NextRequest, NextResponse } from "next/server";
import { getValidGoogleAccessToken, GoogleAuthError } from "@/lib/integrations/google/tokens";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, fileName, mimeType, courseId } = body;

    if (!fileId || !courseId) {
      return NextResponse.json(
        { error: "fileId and courseId are required parameters." },
        { status: 400 }
      );
    }

    // Validate supported academic MIME types
    const ALLOWED_MIME_TYPES = [
      "application/pdf",
      "application/vnd.google-apps.document",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/markdown",
    ];

    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `File type "${mimeType}" is not supported for course knowledge base ingestion.` },
        { status: 400 }
      );
    }

    const accessToken = request.cookies.get("google_meet_token")?.value;
    const refreshToken = request.cookies.get("google_meet_refresh_token")?.value;

    const tokenResult = await getValidGoogleAccessToken(
      {
        accessToken,
        refreshToken,
        expiresAt: accessToken ? Date.now() + 1800000 : 0,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
        status: "connected",
      },
      "drive"
    );

    // Fetch file metadata / content from Google Drive API using authorized access token
    let fileContent = `Google Drive Material: ${fileName}\nFile ID: ${fileId}`;
    try {
      if (mimeType === "application/vnd.google-apps.document") {
        // Export Google Doc as plain text
        const exportRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
          {
            headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
          }
        );
        if (exportRes.ok) {
          fileContent = await exportRes.text();
        }
      } else if (mimeType === "text/plain" || mimeType === "text/markdown") {
        const fileRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
          {
            headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
          }
        );
        if (fileRes.ok) {
          fileContent = await fileRes.text();
        }
      }
    } catch (fetchErr) {
      console.warn("[DriveImport] Could not fetch raw content for file, storing metadata reference:", fetchErr);
    }

    const response = NextResponse.json({
      success: true,
      file: {
        id: fileId,
        title: fileName || "Google Drive Document",
        source: "google-drive",
        contentSnippet: fileContent.slice(0, 200),
      },
    });

    if (tokenResult.updatedTokens) {
      response.cookies.set("google_meet_token", tokenResult.updatedTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600,
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    if (error instanceof GoogleAuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "INSUFFICIENT_SCOPE" ? 403 : 401 }
      );
    }

    console.error("[DriveImport] Error importing Google Drive file:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to import Google Drive file" },
      { status: 500 }
    );
  }
}
