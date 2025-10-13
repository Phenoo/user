import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    conversationId,
  }: { messages: UIMessage[]; conversationId?: string } = await req.json();

  const prompt = convertToModelMessages(messages);

  const result = streamText({
    model: "openai/gpt-4o",
    prompt,
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse({
    //@ts-ignore
    onFinish: async ({ text, isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat aborted");
        return;
      }

      // Save the assistant's response to Convex
      if (conversationId && text) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/messages/add`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                conversationId,
                role: "assistant",
                content: text,
              }),
            }
          );

          if (!response.ok) {
            console.error("[v0] Failed to save message to Convex");
          }
        } catch (error) {
          console.error("[v0] Error saving to Convex:", error);
        }
      }
    },
    consumeSseStream: consumeStream,
  });
}
