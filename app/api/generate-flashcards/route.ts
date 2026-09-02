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
      front: z.string().trim().min(8).max(600).describe("One atomic question or prompt"),
      back: z.string().trim().min(1).max(1600).describe("A concise answer or explanation"),
      difficulty: z
        .enum(["Easy", "Medium", "Hard"])
        .describe("The difficulty level of this flashcard"),
      cardType: z.enum(["basic", "cloze", "basic_reversed"]).optional(),
      explanation: z.string().trim().max(1000).optional(),
      sourceLabel: z.string().trim().max(160).optional(),
    }),
  ),
});

export async function POST(req: NextRequest) {
  try {
    const { topic, count, difficulty, userId, courseId, courseName, userCourses } = await req.json();

    if (!topic || !count) {
      return NextResponse.json({ error: "Topic and count are required" }, { status: 400 });
    }

    // The client can ask for fewer cards, but never use a browser-provided
    // count to bypass the product's generation ceiling. The save mutation
    // also enforces the user's plan limits on the trusted backend boundary.
    const safeCount = Math.min(Math.max(Number(count) || 1, 1), 20);

    const promptText = buildFlashcardsPrompt({
      topic,
      count: safeCount,
      difficulty,
      courseName,
      userCourses,
    });

    const { object } = await generateObjectWithGateway({
      abortSignal: req.signal,
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

    const seen = new Set<string>();
    const flashcards = parsedObject.flashcards.filter((card) => {
      const key = `${card.front.toLowerCase().replace(/\W+/g, " ").trim()}|${card.back.toLowerCase().replace(/\W+/g, " ").trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error("[v0] Error generating flashcards:", error);
    const userFacingError = getUserFacingAIError(error);
    return NextResponse.json(
      { error: userFacingError.message, code: userFacingError.code },
      { status: userFacingError.status }
    );
  }
}
