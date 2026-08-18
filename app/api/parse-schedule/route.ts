import { z } from "zod"
import { NextResponse } from "next/server"
import { getUserFacingAIError } from "@/lib/ai/errors"
import { generateObjectWithGateway } from "@/lib/ai/gateway"
import {
  buildScheduleParserPrompt,
  SCHEDULE_PARSER_PROMPT,
} from "@/lib/ai/prompts"

export const maxDuration = 60

const scheduleSchema = z.object({
  title: z.string().describe("Title or name of the schedule"),
  events: z
    .array(
      z.object({
        subject: z.string().describe("Subject or activity name"),
        time: z.string().describe("Time of the event"),
        duration: z.string().describe("Duration of the event"),
        notes: z.string().optional().describe("Additional notes or details"),
      }),
    )
    .describe("List of scheduled events"),
  date: z.string().optional().describe("Date of the schedule if mentioned"),
})

export async function POST(req: Request) {
  try {
    const { text, userId } = await req.json()

    const { object } = await generateObjectWithGateway({
      feature: "schedule-parser",
      userId,
      promptVersion: `${SCHEDULE_PARSER_PROMPT.id}:${SCHEDULE_PARSER_PROMPT.version}`,
      retrievalQuery: text,
      request: {
        schema: scheduleSchema,
        prompt: buildScheduleParserPrompt(text),
      },
    })

    return Response.json({ schedule: object })
  } catch (error) {
    console.error("[v0] Error parsing schedule:", error)
    const userFacingError = getUserFacingAIError(error)
    return NextResponse.json(
      { error: userFacingError.message, code: userFacingError.code },
      { status: userFacingError.status }
    )
  }
}
