import { generateText } from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  const { topic, length, academicLevel, userId } = await req.json()

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
      console.error("[v0] Failed to save essay to Convex")
    }
  } catch (error) {
    console.error("[v0] Error saving essay to Convex:", error)
  }

  return Response.json({ text })
}
