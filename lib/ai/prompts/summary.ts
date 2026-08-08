export interface SummaryPromptOptions {
  type?: "brief" | "detailed" | "bullet_points";
}

export function buildSummaryPrompt(content: string, options?: SummaryPromptOptions): string {
  const type = options?.type || "detailed";

  return `You are an expert academic assistant. Summarize the following text for a student.

Summary Format Requested: ${type}

Source Text:
---
${content}
---

Provide a clear, accurate, and structured academic summary.`;
}
