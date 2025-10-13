import { generateObject } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export async function POST(req: NextRequest) {
  try {
    const { topic, count, difficulty } = await req.json()

    if (!topic || !count) {
      return NextResponse.json({ error: "Topic and count are required" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: "openai/gpt-4o",
      schema: z.object({
        flashcards: z.array(
          z.object({
            front: z.string().describe("The question or prompt on the front of the card"),
            back: z.string().describe("The answer or explanation on the back of the card"),
            difficulty: z.enum(["Easy", "Medium", "Hard"]).describe("The difficulty level of this flashcard"),
          }),
        ),
      }),
      prompt: `Generate ${count} flashcards for studying the topic: "${topic}".
      
${difficulty ? `Target difficulty level: ${difficulty}` : ""}

Create high-quality flashcards that:
- Test key concepts and understanding
- Are clear and concise
- Have specific, accurate answers
- Progress from basic to advanced concepts
- Use active recall principles

Format each flashcard with a clear question/prompt on the front and a comprehensive answer on the back.`,
    })

    return NextResponse.json({ flashcards: object.flashcards })
  } catch (error) {
    console.error("[v0] Error generating flashcards:", error)
    return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 })
  }
}
