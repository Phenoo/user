import { z } from "zod";
import {
  CommonErrors,
  successResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getUserFacingAIError } from "@/lib/ai/errors";
import { generateTextWithGateway } from "@/lib/ai/gateway";
import { buildSummaryPrompt, SUMMARY_PROMPT } from "@/lib/ai/prompts";

export const maxDuration = 60;

// Input validation schema
const summaryRequestSchema = z.object({
  content: z
    .string()
    .min(50, "Content must be at least 50 characters")
    .max(50000, "Content is too long (max 50,000 characters)"),
  summaryType: z.enum(["brief", "detailed", "bullet"], {
    message: "Summary type must be 'brief', 'detailed', or 'bullet'",
  }),
  userId: z.string().min(1, "User ID is required"),
  courseId: z.string().optional(),
  courseName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validationResult = summaryRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return CommonErrors.badRequest(
        "Invalid input parameters",
        validationResult.error.issues
      );
    }

    const { content, summaryType, userId, courseId, courseName } = validationResult.data;

    const prompt = buildSummaryPrompt({
      content,
      summaryType,
      courseName,
    });

    const { text } = await generateTextWithGateway({
      feature: "summary",
      userId,
      courseId,
      courseName,
      promptVersion: `${SUMMARY_PROMPT.id}:${SUMMARY_PROMPT.version}`,
      retrievalQuery: courseId ? content.slice(0, 240) : undefined,
      request: {
        prompt,
        maxOutputTokens: 3000,
        temperature: 0.5,
      },
    });

    // Save to Convex
    try {
      await fetchMutation(api.generatedContent.save, {
        userId,
        type: "summary",
        prompt: `${summaryType} summary`,
        content: text,
      });
    } catch (error) {
      console.error("Error saving summary to Convex:", error);
    }

    return successResponse({ text }, "Summary generated successfully");
  } catch (error) {
    console.error("Error generating summary:", error);
    const userFacingError = getUserFacingAIError(error);
    return errorResponse(
      userFacingError.message,
      userFacingError.status,
      undefined,
      userFacingError.code
    );
  }
}
