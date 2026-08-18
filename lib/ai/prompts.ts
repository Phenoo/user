export type PromptDefinition = {
  id: string;
  version: string;
};

export const COURSE_CHAT_PROMPT: PromptDefinition = {
  id: "course-chat",
  version: "v2",
};

export const SUMMARY_PROMPT: PromptDefinition = {
  id: "summary",
  version: "v2",
};

export const FLASHCARDS_PROMPT: PromptDefinition = {
  id: "flashcards",
  version: "v2",
};

export const ESSAY_PROMPT: PromptDefinition = {
  id: "essay",
  version: "v2",
};

export const STUDY_GUIDE_PROMPT: PromptDefinition = {
  id: "study-guide",
  version: "v2",
};

export const ASSIGNMENT_PARSER_PROMPT: PromptDefinition = {
  id: "assignment-parser",
  version: "v2",
};

export const SCHEDULE_PARSER_PROMPT: PromptDefinition = {
  id: "schedule-parser",
  version: "v2",
};

export const TOOLS_CHAT_PROMPT: PromptDefinition = {
  id: "tools-chat",
  version: "v1",
};

export const STRUCTURED_OUTPUT_PROMPT: PromptDefinition = {
  id: "structured-output",
  version: "v1",
};

export function buildCourseChatSystemPrompt({
  courseName,
  courseCode,
}: {
  courseName?: string;
  courseCode?: string;
}) {
  if (!courseName && !courseCode) {
    return [
      "You are StudentApp's AI study assistant.",
      "Be accurate, supportive, and clear.",
      "If you are not grounded in private course material, say so plainly.",
    ].join(" ");
  }

  const courseLabel = courseCode
    ? `${courseName || ""} (${courseCode})`.trim()
    : courseName;

  return [
    "You are StudentApp's AI study assistant.",
    `The student is currently working in the course "${courseLabel}".`,
    "Tailor explanations, examples, and terminology to the course when possible.",
    "Separate grounded course facts from general academic knowledge.",
  ].join(" ");
}

export function buildSummaryPrompt({
  content,
  summaryType,
  courseName,
}: {
  content: string;
  summaryType: "brief" | "detailed" | "bullet";
  courseName?: string;
}) {
  const courseContext = courseName
    ? `[Course Reference: ${courseName}]\n\n`
    : "";

  if (summaryType === "brief") {
    return `${courseContext}Provide a brief summary (2-3 paragraphs) of the following content. Focus on the main points and key takeaways:\n\n${content}`;
  }

  if (summaryType === "detailed") {
    return `${courseContext}Provide a detailed summary of the following content. Include all major points, supporting details, and important examples:\n\n${content}`;
  }

  return `${courseContext}Summarize the following content as a bullet-point list. Extract the key points and organize them clearly:\n\n${content}`;
}

export function buildFlashcardsPrompt({
  topic,
  count,
  difficulty,
  courseName,
}: {
  topic: string;
  count: number;
  difficulty?: string;
  courseName?: string;
}) {
  return `Generate ${count} flashcards for studying the topic: "${topic}".
${courseName ? `Course Reference: ${courseName}` : ""}
${difficulty ? `Target difficulty level: ${difficulty}` : ""}

Create high-quality flashcards that:
- Test key concepts and understanding
- Are clear and concise
- Have specific, accurate answers
- Progress from basic to advanced concepts
- Use active recall principles

Format each flashcard with a clear question or prompt on the front and a comprehensive answer on the back.`;
}

export function buildEssayPrompt({
  topic,
  length,
  academicLevel,
  courseName,
}: {
  topic: string;
  length: number;
  academicLevel: "high-school" | "undergraduate" | "graduate" | "phd";
  courseName?: string;
}) {
  return `Write a well-structured academic essay on the following topic: "${topic}"

Requirements:
- Length: ${length} words
- Academic level: ${academicLevel}
${courseName ? `- Course Context: ${courseName}` : ""}
- Include an introduction, body paragraphs with clear arguments, and a conclusion
- Use formal academic language
- Provide specific examples and evidence where appropriate

Please write the complete essay now.`;
}

export function buildStudyGuidePrompt({
  subject,
  topics,
  examDate,
}: {
  subject: string;
  topics: string[];
  examDate?: string;
}) {
  const topicsList = topics.join(", ");

  return `Create a comprehensive study guide for ${subject} covering the following topics: ${topicsList}

${examDate ? `Exam date: ${examDate}` : ""}

Please include:
1. Key concepts and definitions for each topic
2. Important formulas, theories, or principles
3. Practice questions with answers
4. Study tips and memory aids
5. Common mistakes to avoid

Format the study guide in a clear, organized manner that is easy to review.`;
}

export function buildAssignmentParserPrompt(text: string) {
  return `Extract assignment information from the following text. Be thorough and only return details that are actually present:\n\n${text}`;
}

export function buildScheduleParserPrompt(text: string) {
  return `Extract schedule information from the following text. Parse all events, times, and details carefully:\n\n${text}`;
}

export function buildToolsChatSystemPrompt() {
  return `You are StudentApp's AI study assistant. You have access to tools for calculations, study timers, flashcard generation, and citation formatting. Use the appropriate tool when it meaningfully improves the answer, and keep responses encouraging and academically useful.`;
}

export function buildRecipePrompt(prompt: string) {
  return `Generate a recipe based on this description: ${prompt}`;
}
