import { generateText } from "ai"
import { z } from "zod"
import { CommonErrors, successResponse, handleApiError } from "@/lib/api-helpers"

export const maxDuration = 60

// Input validation schema
const essayRequestSchema = z.object({
  topic: z.string().min(10, "Topic must be at least 10 characters").max(500, "Topic is too long"),
  length: z.number().min(100, "Minimum essay length is 100 words").max(5000, "Maximum essay length is 5000 words"),
  academicLevel: z.enum(["high-school", "undergraduate", "graduate", "phd"]),
  userId: z.string().min(1, "User ID is required"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const validationResult = essayRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return CommonErrors.badRequest(
        "Invalid input parameters",
        validationResult.error.issues
      )
    }

    const { topic, length, academicLevel, userId } = validationResult.data

    const prompt = `Write a well-structured academic essay on the following topic: "${topic}"

Requirements:
- Length: ${length} words
- Academic level: ${academicLevel}
- Include an introduction, body paragraphs with clear arguments, and a conclusion
- Use formal academic language
- Provide specific examples and evidence where appropriate

Please write the complete essay now.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 4000,
      temperature: 0.7,
    })

    // Save to Convex
    try {
      const response = await fetch(`${process.env.CONVEX_URL}/api/generatedContent/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type: "essay",
          prompt: topic,
          content: text,
        }),
      })

      if (!response.ok) {
        console.error("Failed to save essay to Convex")
      }
    } catch (error) {
      console.error("Error saving essay to Convex:", error)
    }

    return successResponse({ text }, "Essay generated successfully")
  } catch (error) {
    console.error("Error generating essay:", error)
    return handleApiError(error, "Failed to generate essay")
  }
}
