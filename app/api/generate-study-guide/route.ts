import { generateText } from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  const { subject, topics, examDate, userId } = await req.json()

  const topicsList = topics.join(", ")

  const prompt = `Create a comprehensive study guide for ${subject} covering the following topics: ${topicsList}

${examDate ? `Exam date: ${examDate}` : ""}

Please include:
1. Key concepts and definitions for each topic
2. Important formulas, theories, or principles
3. Practice questions with answers
4. Study tips and memory aids
5. Common mistakes to avoid

Format the study guide in a clear, organized manner that's easy to review.`

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt,
    maxOutputTokens: 4000,
    temperature: 0.6,
  })

  // Save to Convex
  try {
    const response = await fetch(`${process.env.CONVEX_URL}/api/generatedContent/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        type: "study_guide",
        prompt: `${subject} - ${topicsList}`,
        content: text,
      }),
    })

    if (!response.ok) {
      console.error("[v0] Failed to save study guide to Convex")
    }
  } catch (error) {
    console.error("[v0] Error saving study guide to Convex:", error)
  }

  return Response.json({ text })
}
