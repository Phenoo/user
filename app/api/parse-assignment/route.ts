import { z } from "zod"
import { fetchMutation } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { NextResponse } from "next/server"
import { getUserFacingAIError } from "@/lib/ai/errors"
import { generateObjectWithGateway } from "@/lib/ai/gateway"
import {
  ASSIGNMENT_PARSER_PROMPT,
  buildAssignmentParserPrompt,
} from "@/lib/ai/prompts"

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
  try {
    const { text, userId } = await req.json()

    const { object } = await generateObjectWithGateway({
      abortSignal: req.signal,
      feature: "assignment-parser",
      userId,
      promptVersion: `${ASSIGNMENT_PARSER_PROMPT.id}:${ASSIGNMENT_PARSER_PROMPT.version}`,
      retrievalQuery: text,
      request: {
        schema: assignmentSchema,
        prompt: buildAssignmentParserPrompt(text),
      },
    })

    const parsedAssignment = object as z.infer<typeof assignmentSchema>

    // Save to Convex
    try {
      await fetchMutation(api.assignments.save, {
        userId,
        title: parsedAssignment.title,
        description: parsedAssignment.description,
        dueDate: parsedAssignment.dueDate,
        subject: parsedAssignment.subject,
        extractedFrom: text,
      })
    } catch (error) {
      console.error("[v0] Error saving assignment to Convex:", error)
    }

    return Response.json({ assignment: parsedAssignment })
  } catch (error) {
    console.error("[v0] Error parsing assignment:", error)
    const userFacingError = getUserFacingAIError(error)
    return NextResponse.json(
      { error: userFacingError.message, code: userFacingError.code },
      { status: userFacingError.status }
    )
  }
}
