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
    }: {
      messages: UIMessage[];
      userId?: string;
      courseId?: string;
      courseName?: string;
      courseCode?: string;
    } = body;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and cannot be empty" },
        { status: 400 }
      );
    }

    const { result } = await streamTextWithGateway({
      feature: "chat",
      userId,
      courseId,
      courseName,
      courseCode,
      promptVersion: `${COURSE_CHAT_PROMPT.id}:${COURSE_CHAT_PROMPT.version}`,
      retrievalQuery: getLatestUserMessageText(messages),
      baseSystem: buildCourseChatSystemPrompt({
        courseName,
        courseCode,
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
