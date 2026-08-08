import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { extractTextFromUploadedFile } from "@/lib/course-materials/extraction";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");
    const courseId = formData.get("courseId");
    const title = formData.get("title");

    if (!(file instanceof File) || typeof userId !== "string" || typeof courseId !== "string") {
      return NextResponse.json(
        { error: "File, userId, and courseId are required." },
        { status: 400 }
      );
    }

    const extractedText = await extractTextFromUploadedFile(file);

    if (!extractedText || extractedText.length < 40) {
      return NextResponse.json(
        {
          error:
            "StudentApp could not extract enough readable text from that file.",
        },
        { status: 422 }
      );
    }

    const uploadUrl = await fetchMutation(
      (api as any).courseDocuments.generateUploadUrl,
      {
        userId,
        courseId,
      }
    );

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("File upload failed.");
    }

    const { storageId } = await uploadResponse.json();

    const materialId = await fetchMutation(
      (api as any).courseDocuments.createUploadedMaterial,
      {
        userId,
        courseId,
        title:
          typeof title === "string" && title.trim().length > 0
            ? title.trim()
            : file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        storageId,
        extractedText,
      }
    );

    return NextResponse.json({
      materialId,
      extractedCharacters: extractedText.length,
      fileName: file.name,
    });
  } catch (error) {
    console.error("[course-materials.upload] Failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "StudentApp could not upload that material.",
      },
      { status: 500 }
    );
  }
}
