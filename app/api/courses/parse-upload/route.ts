import { NextResponse } from "next/server";
import { z } from "zod";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObjectWithGateway } from "@/lib/ai/gateway";
import {
  COURSE_PARSER_PROMPT,
  buildCourseParserPrompt,
} from "@/lib/ai/prompts";
import { getUserFacingAIError } from "@/lib/ai/errors";
import { extractTextFromUploadedFile } from "@/lib/course-materials/extraction";

export const maxDuration = 60;

const extractedCoursesSchema = z.object({
  courses: z
    .array(
      z.object({
        name: z.string().describe("Course title, e.g. NUMERICAL METHODS II"),
        code: z.string().describe("Course code/identifier, e.g. COS 411"),
        credits: z
          .union([z.number(), z.string()])
          .describe("Credit units or hours, e.g. 2, 3, or 4"),
        academicYear: z
          .string()
          .optional()
          .describe("Academic year/session, e.g. 2022-2023 or 2025"),
        session: z
          .string()
          .optional()
          .describe("Academic session/semester, e.g. 1, Fall, Spring, Summer"),
        instructor: z
          .string()
          .optional()
          .describe("Instructor or professor name if found, otherwise TBD"),
        description: z
          .string()
          .optional()
          .describe("Brief description or notes"),
      })
    )
    .describe("List of extracted courses"),
});

function normalizeSession(sessionStr?: string, fallback = "Fall"): string {
  if (!sessionStr) return fallback;
  const lower = sessionStr.toLowerCase();
  if (
    lower.includes("1") ||
    lower.includes("fall") ||
    lower.includes("first") ||
    lower.includes("harmattan")
  ) {
    return "Fall";
  }
  if (
    lower.includes("2") ||
    lower.includes("spring") ||
    lower.includes("second") ||
    lower.includes("rain")
  ) {
    return "Spring";
  }
  if (
    lower.includes("3") ||
    lower.includes("summer") ||
    lower.includes("third")
  ) {
    return "Summer";
  }
  if (lower.includes("winter")) {
    return "Winter";
  }
  return fallback;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = (formData.get("userId") as string) || "anonymous";
    const defaultAcademicYear =
      (formData.get("defaultAcademicYear") as string) || "2025";
    const defaultSession =
      (formData.get("defaultSession") as string) || "Fall";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No document or image file was uploaded." },
        { status: 400 }
      );
    }

    const fileType = (file.type || "").toLowerCase();
    const fileName = file.name.toLowerCase();
    const isImage =
      fileType.startsWith("image/") ||
      [".png", ".jpg", ".jpeg", ".webp", ".gif"].some((ext) =>
        fileName.endsWith(ext)
      );

    let rawCourses: any[] = [];
    let extractedCharacters = 0;

    // CASE 1: IMAGE UPLOAD (Use Multimodal Vision AI Model)
    if (isImage) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = fileType || "image/jpeg";

      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const visionPrompt = buildCourseParserPrompt(
        "Extract all registered courses, codes, titles, unit credits, and academic year from this image of a course registration form, syllabus, or transcript.",
        defaultAcademicYear,
        defaultSession
      );

      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: extractedCoursesSchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: visionPrompt,
              },
              {
                type: "image",
                image: `data:${mimeType};base64,${base64Data}`,
              },
            ],
          },
        ],
      });

      rawCourses = result.object.courses || [];
      extractedCharacters = base64Data.length;
    } else {
      // CASE 2: PDF / DOCUMENT / TEXT UPLOAD
      const extractedText = await extractTextFromUploadedFile(file);
      extractedCharacters = extractedText.length;

      console.log(
        `[course-parser] Extracted ${extractedText.length} characters from ${file.name}`
      );

      if (!extractedText || extractedText.trim().length < 15) {
        return NextResponse.json(
          {
            error:
              "Could not extract readable course information from this file. If it is a scanned image, please upload it as an image (PNG/JPG).",
          },
          { status: 422 }
        );
      }

      // Run structured extraction with AI
      const prompt = buildCourseParserPrompt(
        extractedText.slice(0, 15000), // Protect token window
        defaultAcademicYear,
        defaultSession
      );

      const { object } = await generateObjectWithGateway({
        feature: "course-parser",
        userId,
        promptVersion: `${COURSE_PARSER_PROMPT.id}:${COURSE_PARSER_PROMPT.version}`,
        retrievalQuery: extractedText.slice(0, 500),
        request: {
          schema: extractedCoursesSchema,
          prompt,
        },
      });

      rawCourses = (object as any)?.courses || [];
    }

    const normalizedCourses = rawCourses.map((c: any) => {
      const parsedCredits =
        typeof c.credits === "number"
          ? c.credits
          : Number.parseFloat(String(c.credits)) || 3;
      return {
        name: String(c.name || "").trim(),
        code: String(c.code || "").trim(),
        credits: parsedCredits > 0 ? parsedCredits : 3,
        academicYear: String(c.academicYear || defaultAcademicYear).trim(),
        session: normalizeSession(c.session, defaultSession),
        instructor: String(c.instructor || "TBD").trim(),
        description: c.description ? String(c.description).trim() : undefined,
      };
    });

    return NextResponse.json({
      courses: normalizedCourses,
      fileName: file.name,
      extractedCharacters,
    });
  } catch (error) {
    console.error("[course-parser] Extraction error:", error);
    const userFacingError = getUserFacingAIError(error);
    return NextResponse.json(
      { error: userFacingError.message, code: userFacingError.code },
      { status: userFacingError.status }
    );
  }
}
