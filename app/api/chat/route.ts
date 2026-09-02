import { UIMessage, convertToModelMessages } from "ai";
import { NextResponse } from "next/server";
import { getUserFacingAIError } from "@/lib/ai/errors";
import { streamTextWithGateway } from "@/lib/ai/gateway";
import {
  buildCourseChatSystemPrompt,
  COURSE_CHAT_PROMPT,
} from "@/lib/ai/prompts";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

function getLatestUserMessageText(messages: UIMessage[]) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  const content = (latestUserMessage as any)?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join(" ")
      .trim();
  }

  return "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages,
      userId,
      courseId,
      courseName,
      courseCode,
      userCourses,
    }: {
      messages: UIMessage[];
      userId?: string;
      courseId?: string;
      courseName?: string;
      courseCode?: string;
      userCourses?: Array<{
        name: string;
        code: string;
        description?: string;
        academicYear?: string;
        session?: string;
        credits?: number;
        instructor?: string;
      }>;
    } = body;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and cannot be empty" },
        { status: 400 }
      );
    }

    const latestQuery = getLatestUserMessageText(messages);
    const normalizedQuery = latestQuery.toLowerCase().replace(/\s+/g, " ");

    let resolvedCourseName = courseName;
    let resolvedCourseCode = courseCode;

    // Auto-detect course from user query if not explicitly passed
    if (!resolvedCourseName && userCourses && userCourses.length > 0) {
      for (const course of userCourses) {
        const cleanCode = (course.code || "").toLowerCase().replace(/\s+/g, "");
        const codeWithSpace = (course.code || "").toLowerCase();
        const cleanName = (course.name || "").toLowerCase();

        if (
          (cleanCode && normalizedQuery.replace(/\s+/g, "").includes(cleanCode)) ||
          (codeWithSpace && normalizedQuery.includes(codeWithSpace)) ||
          (cleanName && normalizedQuery.includes(cleanName))
        ) {
          resolvedCourseName = course.name;
          resolvedCourseCode = course.code;
          break;
        }
      }
    }

    const { result } = await streamTextWithGateway({
      abortSignal: req.signal,
      feature: "chat",
      userId,
      courseId,
      courseName: resolvedCourseName,
      courseCode: resolvedCourseCode,
      promptVersion: `${COURSE_CHAT_PROMPT.id}:${COURSE_CHAT_PROMPT.version}`,
      retrievalQuery: latestQuery,
      baseSystem: buildCourseChatSystemPrompt({
        courseName: resolvedCourseName,
        courseCode: resolvedCourseCode,
        userCourses,
      }),
      request: {
        messages: convertToModelMessages(messages),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    const userFacingError = getUserFacingAIError(error);
    return NextResponse.json(
      {
        error: userFacingError.message,
        code: userFacingError.code,
      },
      { status: userFacingError.status }
    );
  }
}
