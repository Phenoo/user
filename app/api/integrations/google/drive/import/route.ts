import { type NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { GoogleAuthError } from "@/lib/integrations/google/tokens";
import {
  resolveGoogleCredentials,
  setGoogleCredentialCookies,
} from "@/lib/integrations/google/credentials";
import { getAuthenticatedUser } from "@/lib/server/convex-auth";

export async function POST(request: NextRequest) {
  const authentication = await getAuthenticatedUser();
  if (!authentication) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

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

    const credentials = await resolveGoogleCredentials(
      request,
      authentication,
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
            headers: { Authorization: `Bearer ${credentials.accessToken}` },
          }
        );
        if (exportRes.ok) {
          fileContent = await exportRes.text();
        }
      } else if (mimeType === "text/plain" || mimeType === "text/markdown") {
        const fileRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
          {
            headers: { Authorization: `Bearer ${credentials.accessToken}` },
          }
        );
        if (fileRes.ok) {
          fileContent = await fileRes.text();
        }
      }
    } catch (fetchErr) {
      console.warn("[DriveImport] Could not fetch raw content for file, storing metadata reference:", fetchErr);
    }

    const materialResult = await fetchMutation(
      api.courseDocuments.upsertGoogleDriveMaterial,
      {
        userId: authentication.user._id,
        courseId,
        externalId: `${courseId}:${fileId}`,
        title: fileName || "Google Drive Document",
        content:
          fileContent.trim().length >= 40
            ? fileContent
            : `${fileContent}\nImported from the user's selected Google Drive file.`,
        fileName,
        mimeType,
      },
      { token: authentication.token }
    );

    const response = NextResponse.json({
      success: true,
      file: {
        id: fileId,
        materialId: materialResult.materialId,
        created: materialResult.created,
        title: fileName || "Google Drive Document",
        source: "google-drive",
        contentSnippet: fileContent.slice(0, 200),
      },
    });

    setGoogleCredentialCookies(response, credentials);

    return response;
  } catch (error: unknown) {
    if (error instanceof GoogleAuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "INSUFFICIENT_SCOPE" ? 403 : 401 }
      );
    }

    console.error("[DriveImport] Error importing Google Drive file:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to import Google Drive file",
      },
      { status: 500 }
    );
  }
}
