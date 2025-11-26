import { generateObject } from "ai";
import { z } from "zod";

const recipeSchema = z.object({
  name: z.string().describe("Name of the recipe"),
  ingredients: z.array(z.string()).describe("List of ingredients"),
  instructions: z.array(z.string()).describe("Step-by-step instructions"),
  servings: z.number().describe("Number of servings"),
  prepTime: z.number().describe("Preparation time in minutes"),
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const { object } = await generateObject({
    model: "openai/gpt-4o-mini",
    schema: recipeSchema,
    prompt: `Generate a recipe based on this description: ${prompt}`,
  });

  return Response.json({ recipe: object });
}
