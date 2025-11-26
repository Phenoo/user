import { generateText } from "ai"
import { z } from "zod"
import { CommonErrors, successResponse, handleApiError } from "@/lib/api-helpers"

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

    const prompt = `Create a comprehensive study guide for ${subject} covering the following topics: ${topicsList}

${examDate ? `Exam date: ${examDate}` : ""}

Please include:
1. Key concepts and definitions for each topic
2. Important formulas, theories, or principles
3. Practice questions with answers
4. Study tips and memory aids
5. Common mistakes to avoid

Format the study guide in a clear, organized manner that's easy to review.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 4000,
      temperature: 0.6,
    })

    // Save to Convex
    try {
      const response = await fetch(`${process.env.CONVEX_URL}/api/generatedContent/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type: "study_guide",
          prompt: `${subject} - ${topicsList}`,
          content: text,
        }),
      })

      if (!response.ok) {
        console.error("Failed to save study guide to Convex")
      }
    } catch (error) {
      console.error("Error saving study guide to Convex:", error)
    }

    return successResponse({ text }, "Study guide generated successfully")
  } catch (error) {
    console.error("Error generating study guide:", error)
    return handleApiError(error, "Failed to generate study guide")
  }
}
