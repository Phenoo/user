export function buildAssignmentParserPrompt(rawText: string): string {
  return `Extract structured assignment details from the following raw text or syllabus excerpt:

Text:
---
${rawText}
---

Extract the assignment title, due date, description, and key requirements.`;
}
