export interface ChatPromptContext {
  courseName?: string;
  courseCode?: string;
  instructor?: string;
}

export function buildChatSystemPrompt(context?: ChatPromptContext): string {
  let prompt = "You are StudentApp Assistant, a helpful AI tutor for students. You assist with studying, assignments, concepts, and time management.";

  if (context?.courseName) {
    prompt += `\n\nActive Course Context:\n- Course: ${context.courseName}${context.courseCode ? ` (${context.courseCode})` : ""}`;
    if (context.instructor) {
      prompt += `\n- Instructor: ${context.instructor}`;
    }
    prompt += "\nPlease tailor your explanations and examples specifically to this course material where appropriate.";
  }

  return prompt;
}
