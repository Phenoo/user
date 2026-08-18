export type AIProvider = "deepseek" | "openai";

export type TaskMode = "standard" | "deep-reasoning";
export type AIRequestMode = TaskMode;
export type SubscriptionPlan = "FREE" | "STUDENT" | "STUDENTPRO";
export type AIFeature =
  | "chat"
  | "summary"
  | "flashcards"
  | "essay"
  | "study-guide"
  | "assignment-parser"
  | "schedule-parser"
  | "quiz"
  | "tools-chat"
  | "structured-output"
  | "deep-reasoning"
  | string;


export interface AIModelPricing {
  inputPerMillion: number;
  cachedInputPerMillion?: number;
  outputPerMillion: number;
}

export interface AIModelCapabilities {
  reasoning: boolean;
  tools: boolean;
  structuredOutput: boolean;
}

export interface AIModelAvailability {
  FREE: boolean;
  STUDENT: boolean;
  STUDENTPRO: boolean;
}

export interface AIModelDefinition {
  id: string;
  provider: AIProvider;
  displayName: string;
  pricing: AIModelPricing;
  capabilities: AIModelCapabilities;
  availability: AIModelAvailability;
  mode: TaskMode;
}

export const SUPPORTED_MODELS: Record<string, AIModelDefinition> = {
  "deepseek-chat": {
    id: "deepseek-chat",
    provider: "deepseek",
    displayName: "DeepSeek V3",
    pricing: {
      inputPerMillion: 0.14,
      cachedInputPerMillion: 0.014,
      outputPerMillion: 0.28,
    },
    capabilities: {
      reasoning: false,
      tools: true,
      structuredOutput: true,
    },
    availability: {
      FREE: true,
      STUDENT: true,
      STUDENTPRO: true,
    },
    mode: "standard",
  },
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    provider: "deepseek",
    displayName: "DeepSeek R1 (Reasoner)",
    pricing: {
      inputPerMillion: 0.55,
      cachedInputPerMillion: 0.14,
      outputPerMillion: 2.19,
    },
    capabilities: {
      reasoning: true,
      tools: false,
      structuredOutput: true,
    },
    availability: {
      FREE: false,
      STUDENT: false,
      STUDENTPRO: true,
    },
    mode: "deep-reasoning",
  },
};

export const DEFAULT_MODEL_ID = "deepseek-chat";
