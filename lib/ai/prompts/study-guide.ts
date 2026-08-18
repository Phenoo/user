export function buildStudyGuidePrompt(topicOrContent: string): string {
  return `Create a comprehensive academic study guide for the following material:

Material:
${topicOrContent}

Include key concepts, definitions, practice questions, and summary takeaways.`;
}
