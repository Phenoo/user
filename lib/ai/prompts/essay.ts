export interface EssayPromptOptions {
  topic: string;
  type?: string;
  tone?: string;
  targetLength?: string;
}

export function buildEssayPrompt(options: EssayPromptOptions): string {
  return `You are an academic writing tutor helping a student outline and draft an essay.

Topic: ${options.topic}
Type: ${options.type || "Argumentative"}
Tone: ${options.tone || "Academic"}
Length: ${options.targetLength || "Medium"}

Provide a structured essay outline followed by a initial section draft to help the student get started.`;
}
