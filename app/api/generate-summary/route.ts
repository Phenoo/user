import { generateText } from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  const { content, summaryType, userId } = await req.json()

  let prompt = ""

  if (summaryType === "brief") {
    prompt = `Provide a brief summary (2-3 paragraphs) of the following content. Focus on the main points and key takeaways:\n\n${content}`
  } else if (summaryType === "detailed") {
    prompt = `Provide a detailed summary of the following content. Include all major points, supporting details, and important examples:\n\n${content}`
  } else if (summaryType === "bullet") {
    prompt = `Summarize the following content as a bullet-point list. Extract the key points and organize them clearly:\n\n${content}`
  }

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt,
    maxOutputTokens: 3000,
    temperature: 0.5,
  })

  // Save to Convex
  try {
    const response = await fetch(`${process.env.CONVEX_URL}/api/generatedContent/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        type: "summary",
        prompt: `${summaryType} summary`,
        content: text,
      }),
    })

    if (!response.ok) {
      console.error("[v0] Failed to save summary to Convex")
    }
  } catch (error) {
    console.error("[v0] Error saving summary to Convex:", error)
  }

  return Response.json({ text })
}
