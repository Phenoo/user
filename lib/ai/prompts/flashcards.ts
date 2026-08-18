export interface FlashcardsPromptOptions {
  count?: number;
  difficulty?: string;
}

export function buildFlashcardsPrompt(topicOrContent: string, options?: FlashcardsPromptOptions): string {
  const count = options?.count || 5;

  return `Generate exactly ${count} educational flashcards based on the following material:

Material:
${topicOrContent}

Each flashcard must have a concise front (question or concept) and back (answer or detailed explanation).`;
}
