import { z } from "zod"
import { CommonErrors, successResponse, errorResponse } from "@/lib/api-helpers"
import { fetchMutation } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { getUserFacingAIError } from "@/lib/ai/errors"
import { generateTextWithGateway } from "@/lib/ai/gateway"
import { buildStudyGuidePrompt, STUDY_GUIDE_PROMPT } from "@/lib/ai/prompts"

export const maxDuration = 60

// Input validation schema
const studyGuideRequestSchema = z.object({
  subject: z.string().min(2, "Subject must be at least 2 characters").max(100, "Subject is too long"),
  topics: z.array(z.string().min(1)).min(1, "At least one topic is required").max(20, "Maximum 20 topics allowed"),
  examDate: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const validationResult = studyGuideRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return CommonErrors.badRequest(
        "Invalid input parameters",
        validationResult.error.issues
      )
    }

    const { subject, topics, examDate, userId } = validationResult.data

    const topicsList = topics.join(", ")
    const prompt = buildStudyGuidePrompt({
      subject,
      topics,
      examDate,
    })

    const { text } = await generateTextWithGateway({
      feature: "study-guide",
      userId,
      promptVersion: `${STUDY_GUIDE_PROMPT.id}:${STUDY_GUIDE_PROMPT.version}`,
      retrievalQuery: `${subject} ${topicsList}`,
      request: {
        prompt,
        maxOutputTokens: 4000,
        temperature: 0.6,
      },
    })

    // Save to Convex
    try {
      await fetchMutation(api.generatedContent.save, {
        userId,
        type: "study_guide",
        prompt: `${subject} - ${topicsList}`,
        content: text,
      })
    } catch (error) {
      console.error("Error saving study guide to Convex:", error)
    }

    return successResponse({ text }, "Study guide generated successfully")
  } catch (error) {
    console.error("Error generating study guide:", error)
    const userFacingError = getUserFacingAIError(error)
    return errorResponse(
      userFacingError.message,
      userFacingError.status,
      undefined,
      userFacingError.code
    )
  }
}
