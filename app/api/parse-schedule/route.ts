import { generateObject } from "ai"
import { z } from "zod"

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
  const { text, userId } = await req.json()

  const { object } = await generateObject({
    model: "openai/gpt-4o",
    schema: scheduleSchema,
    prompt: `Extract schedule information from the following text. Parse all events, times, and details:\n\n${text}`,
  })

  // Save to Convex
  try {
    const response = await fetch(`${process.env.CONVEX_URL}/api/schedules/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: object.title,
        events: object.events,
        extractedFrom: text,
      }),
    })

    if (!response.ok) {
      console.error("[v0] Failed to save schedule to Convex")
    }
  } catch (error) {
    console.error("[v0] Error saving schedule to Convex:", error)
  }

  return Response.json({ schedule: object })
}
