import { z } from "zod";
import { generateObjectWithGateway } from "@/lib/ai/gateway";
import { getUserFacingAIError } from "@/lib/ai/errors";
import {
  buildRecipePrompt,
  STRUCTURED_OUTPUT_PROMPT,
} from "@/lib/ai/prompts";

const recipeSchema = z.object({
  name: z.string().describe("Name of the recipe"),
  ingredients: z.array(z.string()).describe("List of ingredients"),
  instructions: z.array(z.string()).describe("Step-by-step instructions"),
  servings: z.number().describe("Number of servings"),
  prepTime: z.number().describe("Preparation time in minutes"),
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const { object } = await generateObjectWithGateway({
      abortSignal: req.signal,
      feature: "structured-output",
      promptVersion: `${STRUCTURED_OUTPUT_PROMPT.id}:${STRUCTURED_OUTPUT_PROMPT.version}`,
      request: {
        schema: recipeSchema,
        prompt: buildRecipePrompt(prompt),
      },
    });

    return Response.json({ recipe: object });
  } catch (error) {
    const userFacingError = getUserFacingAIError(error);
    return Response.json(
      { error: userFacingError.message, code: userFacingError.code },
      { status: userFacingError.status }
    );
  }
}
