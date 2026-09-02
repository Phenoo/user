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
  version: "v3",
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
  version: "v3",
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
  userCourses,
}: {
  courseName?: string;
  courseCode?: string;
  userCourses?: Array<{
    name: string;
    code: string;
    description?: string;
    academicYear?: string;
    session?: string;
    credits?: number;
    instructor?: string;
  }>;
}) {
  const coursesContext =
    userCourses && userCourses.length > 0
      ? `\n\nTHE STUDENT'S ENROLLED COURSES IN STUDENTAPP:
${userCourses
  .map(
    (c) =>
      `• ${c.code ? `[${c.code}] ` : ""}${c.name}${c.credits ? ` (${c.credits} Units)` : ""}${c.instructor && c.instructor !== "TBD" ? ` - Instructor: ${c.instructor}` : ""}${c.description ? ` - Info: ${c.description}` : ""}`
  )
  .join("\n")}

CRITICAL RULES FOR COURSE GROUNDING:
1. Always map any course code (e.g. "COS 417", "COS 411", "COS 351", "COS 419", "COS 421", "COS 441", "COS 463", "COS 431", "COS 435") to the student's exact enrolled course listed above (e.g., "COS 417" is "COMPUTER SYSTEM PERFORMANCE EVALUATION").
2. NEVER guess, assume, or hallucinate other universities (do NOT assume COS 417 is Machine Learning at Princeton or any other institution). It is strictly the student's enrolled course: "COMPUTER SYSTEM PERFORMANCE EVALUATION".
3. When the student asks for flashcards, explanations, practice questions, or summaries for any course, GENERATE high-yield, academically accurate study material directly in your response. Do not decline or ask them to manually paste topics unless they explicitly want a custom syllabus subtopic.`
      : "";

  if (!courseName && !courseCode) {
    return `You are StudentApp's AI Study Assistant & Academic Coach.
You help university students study, master their curriculum, understand difficult concepts, create flashcards, solve practice problems, and ace their exams.${coursesContext}

Be encouraging, concise, academically rigorous, and directly helpful. When asked to create flashcards, generate questions, or explain concepts for a course, deliver ready-to-study material immediately.`;
  }

  const courseLabel = courseCode
    ? `${courseName || ""} (${courseCode})`.trim()
    : courseName;

  return `You are StudentApp's AI Study Assistant & Academic Coach.
The student is currently working in the course: "${courseLabel}".${coursesContext}

Tailor all explanations, examples, formulas, flashcards, and practice problems directly to this course curriculum. Deliver ready-to-study, high-yield material directly.`;
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

  const instructions =
    "Preserve important terminology, definitions, formulas, and relationships from the source. Do not invent facts or add information that is not supported by the source text.";

  if (summaryType === "brief") {
    return `${courseContext}You are an expert academic tutor. Provide a brief summary in 2-3 paragraphs. Focus on the main points and key takeaways. ${instructions}\n\nSource text:\n---\n${content}\n---`;
  }

  if (summaryType === "detailed") {
    return `${courseContext}You are an expert academic tutor. Provide a detailed, structured summary. Include all major points, supporting details, examples, definitions, and formulas that appear in the source. ${instructions}\n\nSource text:\n---\n${content}\n---`;
  }

  return `${courseContext}You are an expert academic tutor. Summarize the source as a clear, nested bullet-point list. Group related ideas and include important definitions, formulas, and examples from the source. ${instructions}\n\nSource text:\n---\n${content}\n---`;
}

export function buildFlashcardsPrompt({
  topic,
  count,
  difficulty,
  courseName,
  userCourses,
}: {
  topic: string;
  count: number;
  difficulty?: string;
  courseName?: string;
  userCourses?: Array<{ name: string; code: string; description?: string }>;
}) {
  let resolvedCourseContext = courseName || "";
  if (!resolvedCourseContext && userCourses && userCourses.length > 0) {
    const cleanTopic = topic.toLowerCase().replace(/\s+/g, "");
    const match = userCourses.find(
      (c) =>
        (c.code && cleanTopic.includes(c.code.toLowerCase().replace(/\s+/g, ""))) ||
        (c.name && cleanTopic.includes(c.name.toLowerCase().replace(/\s+/g, "")))
    );
    if (match) {
      resolvedCourseContext = `${match.name} (${match.code})`;
    }
  }

  return `Generate ${count} high-yield, academically rigorous flashcards for studying: "${topic}".
${resolvedCourseContext ? `Target Course: ${resolvedCourseContext}` : ""}
${difficulty ? `Target difficulty level: ${difficulty}` : ""}

Rules for generating flashcards:
- Each card must test one retrievable idea. Split lists, multi-part questions, and broad "explain everything" prompts into separate cards.
- Prefer active recall, definitions, mechanisms, comparisons, equations, and small applied scenarios over trivia.
- Never put the answer in the wording of the question, duplicate cards, or invent lecturer-specific claims.
- Keep the front concise and the back complete but compact. Preserve course terminology.
- When source material is provided, treat it as authoritative and do not confidently fill gaps with generic knowledge.
- Add a cloze card only when the missing phrase is unambiguous; otherwise use a basic card.
- If the topic or course refers to an academic course (e.g. "COS 417" -> "COMPUTER SYSTEM PERFORMANCE EVALUATION"), generate accurate flashcards covering that exact subject (e.g. Queuing Theory, Markov Models, Bottleneck Analysis, Throughput, Response Time, Amdahl's Law, Little's Law, System Benchmarking, Petri Nets).
- Never hallucinate unrelated subjects or other institutions.
- Ensure questions are direct, clear, and test conceptual understanding or problem solving.
- Provide concise, accurate explanations on the back.
- Progress from foundational principles to advanced concepts.`;
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

  return `You are an expert academic tutor creating a practical study guide for a student.

Subject: ${subject}
Topics: ${topicsList}

${examDate ? `Exam date: ${examDate}` : "No exam date was provided."}

Create a clear Markdown guide with these sections:
1. Learning objectives
2. Key concepts and definitions for each topic
3. Important formulas, theories, or principles, where applicable
4. Common mistakes and misconceptions
5. Practice questions, followed by a separate answer key with brief explanations
6. Study tips and memory aids
7. A prioritized revision checklist

Use only the subject and topics provided. Do not invent a lecturer's syllabus, institution-specific requirements, citations, or facts presented as course-specific. If a topic is ambiguous, state the assumption briefly and keep the material broadly academically accurate. Make the guide concise enough to review but detailed enough to support exam preparation.`;
}

export function buildAssignmentParserPrompt(text: string) {
  return `Extract assignment information from the following text. Be thorough and only return details that are actually present:\n\n${text}`;
}

export function buildScheduleParserPrompt(text: string) {
  return `Extract schedule information from the following text. Parse all events, times, and details carefully:\n\n${text}`;
}

export function buildToolsChatSystemPrompt(
  userCourses?: Array<{
    name: string;
    code: string;
    description?: string;
    credits?: number;
    instructor?: string;
  }>
) {
  const coursesContext =
    userCourses && userCourses.length > 0
      ? `\n\nTHE STUDENT'S REGISTERED COURSES:
${userCourses
  .map(
    (c) =>
      `• [${c.code}] ${c.name}${c.credits ? ` (${c.credits} Units)` : ""}${c.instructor && c.instructor !== "TBD" ? ` - Instructor: ${c.instructor}` : ""}${c.description ? ` - Info: ${c.description}` : ""}`
  )
  .join("\n")}

CRITICAL: Always ground your study assistance, flashcards, explanations, and calculations in the student's actual courses above. Never guess other universities or unrelated courses.`
      : "";

  return `You are StudentApp's AI study assistant. You have access to tools for calculations, study timers, flashcard generation, and citation formatting. Use the appropriate tool when it meaningfully improves the answer, and keep responses encouraging, academically rigorous, and directly useful.${coursesContext}`;
}

export function buildRecipePrompt(prompt: string) {
  return `Generate a recipe based on this description: ${prompt}`;
}

export const COURSE_PARSER_PROMPT: PromptDefinition = {
  id: "course-parser",
  version: "v2",
};

export function buildCourseParserPrompt(
  documentText: string,
  defaultYear?: string,
  defaultSession?: string
) {
  return `You are an expert academic registrar, curriculum parser, and syllabus analyzer.
Analyze the following academic document (which can be a Course Registration Form, Course Schedule, Syllabus, University Curriculum, Transcript, or Degree Plan) and extract EVERY registered or listed course.

Rules for extraction:
1. Look for tables, lists, or headers containing courses (e.g. "REGISTERED COURSES", "COURSE CODE", "COURSE TITLE", "UNIT", "CREDITS", "SEMESTER", "SESSION").
2. Extract each individual course:
   - "name": The full title/name of the course (e.g. "NUMERICAL METHODS II", "LABORATORY FOR DIGITAL SYSTEM DESIGN", "DATABASE DESIGN AND MANAGEMENT").
   - "code": The course code (e.g. "COS 411", "COS 351", "COS417", "CS101").
   - "credits": The unit load or credit hours (e.g. if the document says UNIT: 2 or 3, use 2 or 3; default to 3 if omitted).
   - "academicYear": The academic year or session mentioned in the document (e.g. "2022-2023" or "2025"). If not stated, use "${defaultYear || "2025"}".
   - "session": The semester or term. If the document specifies "1", "First Semester", or "Harmattan", map it to "Fall". If it specifies "2" or "Second Semester" or "Rain", map it to "Spring". If "3", map to "Summer". Default to "${defaultSession || "Fall"}".
   - "instructor": The lecturer, professor, or instructor name if available, otherwise "TBD".
   - "description": A brief summary or note about the course if present, or leave empty.

Document content:
"""
${documentText}
"""

Be extremely thorough and extract all valid courses present in the text. Return only the structured courses.`;
}
