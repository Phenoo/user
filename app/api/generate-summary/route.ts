import { generateText } from "ai";
import { z } from "zod";
import {
  CommonErrors,
  successResponse,
  handleApiError,
} from "@/lib/api-helpers";

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

    const { content, summaryType, userId } = validationResult.data;

    let prompt = "";

    if (summaryType === "brief") {
      prompt = `Provide a brief summary (2-3 paragraphs) of the following content. Focus on the main points and key takeaways:\n\n${content}`;
    } else if (summaryType === "detailed") {
      prompt = `Provide a detailed summary of the following content. Include all major points, supporting details, and important examples:\n\n${content}`;
    } else if (summaryType === "bullet") {
      prompt = `Summarize the following content as a bullet-point list. Extract the key points and organize them clearly:\n\n${content}`;
    }

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 3000,
      temperature: 0.5,
    });

    // Save to Convex
    try {
      const response = await fetch(
        `${process.env.CONVEX_URL}/api/generatedContent/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            type: "summary",
            prompt: `${summaryType} summary`,
            content: text,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to save summary to Convex");
      }
    } catch (error) {
      console.error("Error saving summary to Convex:", error);
    }

    return successResponse({ text }, "Summary generated successfully");
  } catch (error) {
    console.error("Error generating summary:", error);
    return handleApiError(error, "Failed to generate summary");
  }
}
