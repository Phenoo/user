import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserFacingAIError } from "@/lib/ai/errors";
import { generateObjectWithGateway } from "@/lib/ai/gateway";
import {
  buildFlashcardsPrompt,
  FLASHCARDS_PROMPT,
} from "@/lib/ai/prompts";

const flashcardsSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z
        .string()
        .describe("The question or prompt on the front of the card"),
      back: z
        .string()
        .describe("The answer or explanation on the back of the card"),
      difficulty: z
        .enum(["Easy", "Medium", "Hard"])
        .describe("The difficulty level of this flashcard"),
    }),
  ),
});

export async function POST(req: NextRequest) {
  try {
    const { topic, count, difficulty, userId, courseId, courseName } = await req.json();

    if (!topic || !count) {
      return NextResponse.json({ error: "Topic and count are required" }, { status: 400 });
    }

    const promptText = buildFlashcardsPrompt({
      topic,
      count,
      difficulty,
      courseName,
    });

    const { object } = await generateObjectWithGateway({
      feature: "flashcards",
      userId,
      courseId,
      courseName,
      promptVersion: `${FLASHCARDS_PROMPT.id}:${FLASHCARDS_PROMPT.version}`,
      retrievalQuery: topic,
      request: {
        schema: flashcardsSchema,
        prompt: promptText,
      },
    });

    const parsedObject = object as z.infer<typeof flashcardsSchema>;

    return NextResponse.json({ flashcards: parsedObject.flashcards });
  } catch (error) {
    console.error("[v0] Error generating flashcards:", error);
    const userFacingError = getUserFacingAIError(error);
    return NextResponse.json(
      { error: userFacingError.message, code: userFacingError.code },
      { status: userFacingError.status }
    );
  }
}
