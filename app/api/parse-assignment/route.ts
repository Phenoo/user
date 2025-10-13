import { generateObject } from "ai"
import { z } from "zod"

export const maxDuration = 60

const assignmentSchema = z.object({
  title: z.string().describe("The title or name of the assignment"),
  description: z.string().describe("Detailed description of what needs to be done"),
  dueDate: z.string().optional().describe("Due date in YYYY-MM-DD format if mentioned"),
  subject: z.string().optional().describe("Subject or course name"),
  requirements: z.array(z.string()).optional().describe("List of specific requirements or tasks"),
  estimatedTime: z.string().optional().describe("Estimated time to complete"),
})

export async function POST(req: Request) {
  const { text, userId } = await req.json()

  const { object } = await generateObject({
    model: "openai/gpt-4o",
    schema: assignmentSchema,
    prompt: `Extract assignment information from the following text. Be thorough and extract all relevant details:\n\n${text}`,
  })

  // Save to Convex
  try {
    const response = await fetch(`${process.env.CONVEX_URL}/api/assignments/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: object.title,
        description: object.description,
        dueDate: object.dueDate,
        subject: object.subject,
        extractedFrom: text,
      }),
    })

    if (!response.ok) {
      console.error("[v0] Failed to save assignment to Convex")
    }
  } catch (error) {
    console.error("[v0] Error saving assignment to Convex:", error)
  }

  return Response.json({ assignment: object })
}
