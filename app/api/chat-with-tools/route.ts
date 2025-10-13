import {
  convertToModelMessages,
  type InferUITools,
  stepCountIs,
  streamText,
  tool,
  type UIDataTypes,
  type UIMessage,
  validateUIMessages,
} from "ai"
import { z } from "zod"

export const maxDuration = 30

const calculatorTool = tool({
  description: "Perform mathematical calculations. Use this for any math problems or equations.",
  inputSchema: z.object({
    expression: z.string().describe("The mathematical expression to evaluate (e.g., '2 + 2', '5 * 10', 'sqrt(16)')"),
  }),
  async *execute({ expression }) {
    yield { state: "calculating" as const }

    // Simple math evaluation (in production, use a proper math library)
    try {
      // Basic calculator implementation
      let result: number

      // Handle common math operations
      if (expression.includes("sqrt")) {
        const num = Number.parseFloat(expression.replace(/sqrt$$|$$/g, ""))
        result = Math.sqrt(num)
      } else if (expression.includes("^")) {
        const [base, exp] = expression.split("^").map((n) => Number.parseFloat(n.trim()))
        result = Math.pow(base, exp)
      } else {
        // Use Function constructor for basic arithmetic (be careful in production)
        result = Function(`"use strict"; return (${expression})`)()
      }

      yield {
        state: "ready" as const,
        result: result.toString(),
        expression,
      }
    } catch (error) {
      yield {
        state: "error" as const,
        error: "Invalid mathematical expression",
      }
    }
  },
})

const studyTimerTool = tool({
  description: "Create a study timer or pomodoro session. Helps students manage study time effectively.",
  inputSchema: z.object({
    duration: z.number().describe("Duration in minutes"),
    subject: z.string().describe("Subject or topic to study"),
  }),
  async *execute({ duration, subject }) {
    yield { state: "setting" as const }

    yield {
      state: "ready" as const,
      duration,
      subject,
      message: `Study timer set for ${duration} minutes on ${subject}`,
    }
  },
})

const flashcardGeneratorTool = tool({
  description: "Generate flashcards for studying a topic. Creates question-answer pairs.",
  inputSchema: z.object({
    topic: z.string().describe("The topic to create flashcards for"),
    count: z.number().describe("Number of flashcards to generate"),
  }),
  async *execute({ topic, count }) {
    yield { state: "generating" as const }

    // In a real implementation, this would use AI to generate flashcards
    const flashcards = Array.from({ length: count }, (_, i) => ({
      question: `Question ${i + 1} about ${topic}`,
      answer: `Answer ${i + 1} about ${topic}`,
    }))

    yield {
      state: "ready" as const,
      flashcards,
      topic,
    }
  },
})

const citationGeneratorTool = tool({
  description: "Generate citations in various formats (APA, MLA, Chicago) for academic papers.",
  inputSchema: z.object({
    format: z.enum(["APA", "MLA", "Chicago"]).describe("Citation format"),
    source: z.object({
      type: z.enum(["book", "website", "journal"]).describe("Type of source"),
      title: z.string().describe("Title of the source"),
      author: z.string().optional().describe("Author name"),
      year: z.string().optional().describe("Publication year"),
      url: z.string().optional().describe("URL for websites"),
    }),
  }),
  async *execute({ format, source }) {
    yield { state: "generating" as const }

    let citation = ""

    if (format === "APA") {
      citation = `${source.author || "Unknown"}. (${source.year || "n.d."}). ${source.title}. ${source.url || ""}`
    } else if (format === "MLA") {
      citation = `${source.author || "Unknown"}. "${source.title}." ${source.year || "n.d."}. ${source.url || ""}`
    } else {
      citation = `${source.author || "Unknown"}, "${source.title}" (${source.year || "n.d."}). ${source.url || ""}`
    }

    yield {
      state: "ready" as const,
      citation,
      format,
    }
  },
})

const tools = {
  calculator: calculatorTool,
  studyTimer: studyTimerTool,
  flashcardGenerator: flashcardGeneratorTool,
  citationGenerator: citationGeneratorTool,
} as const

export type ChatWithToolsMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>

export async function POST(req: Request) {
  const body = await req.json()

  const messages = await validateUIMessages<ChatWithToolsMessage>({
    messages: body.messages,
    tools,
  })

  const result = streamText({
    model: "openai/gpt-4o",
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
    system: `You are a helpful AI study assistant for students. You have access to several tools:
    
1. Calculator - Use this for any math problems or calculations
2. Study Timer - Help students set up study sessions
3. Flashcard Generator - Create study flashcards for any topic
4. Citation Generator - Generate proper citations for academic papers

Always use the appropriate tool when a student asks for help with these tasks. Be encouraging and supportive in your responses.`,
  })

  return result.toUIMessageStreamResponse()
}
