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
import { buildEssayPrompt, ESSAY_PROMPT } from "@/lib/ai/prompts";

export const maxDuration = 60;

// Input validation schema
const essayRequestSchema = z.object({
  topic: z.string().min(10, "Topic must be at least 10 characters").max(500, "Topic is too long"),
  length: z.number().min(100, "Minimum essay length is 100 words").max(5000, "Maximum essay length is 5000 words"),
  academicLevel: z.enum(["high-school", "undergraduate", "graduate", "phd"]),
  userId: z.string().min(1, "User ID is required"),
  courseId: z.string().optional(),
  courseName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validationResult = essayRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return CommonErrors.badRequest(
        "Invalid input parameters",
        validationResult.error.issues
      );
    }

    const { topic, length, academicLevel, userId, courseId, courseName } = validationResult.data;

    const prompt = buildEssayPrompt({
      topic,
      length,
      academicLevel,
      courseName,
    });

    const { text } = await generateTextWithGateway({
      abortSignal: req.signal,
      feature: "essay",
      userId,
      courseId,
      courseName,
      promptVersion: `${ESSAY_PROMPT.id}:${ESSAY_PROMPT.version}`,
      retrievalQuery: topic,
      request: {
        prompt,
        maxOutputTokens: 4000,
        temperature: 0.7,
      },
    });

    // Save to Convex
    try {
      await fetchMutation(api.generatedContent.save, {
        userId,
        type: "essay",
        prompt: topic,
        content: text,
      });
    } catch (error) {
      console.error("Error saving essay to Convex:", error);
    }

    return successResponse({ text }, "Essay generated successfully");
  } catch (error) {
    console.error("Error generating essay:", error);
    const userFacingError = getUserFacingAIError(error);
    return errorResponse(
      userFacingError.message,
      userFacingError.status,
      undefined,
      userFacingError.code
    );
  }
}
