export * from "./chat";
export * from "./summary";
export * from "./flashcards";
export * from "./essay";
export * from "./assignment-parser";
export * from "./study-guide";

export const COURSE_CHAT_PROMPT = {
  id: "course_chat",
  version: "v1.0",
};

export const buildCourseChatSystemPrompt = (context?: {
  courseName?: string;
  courseCode?: string;
  instructor?: string;
}) => {
  let prompt = "You are StudentApp Assistant, a helpful AI tutor for students.";
  if (context?.courseName) {
    prompt += `\n\nActive Course Context:\n- Course: ${context.courseName}${context.courseCode ? ` (${context.courseCode})` : ""}`;
    if (context.instructor) {
      prompt += `\n- Instructor: ${context.instructor}`;
    }
  }
  return prompt;
};
