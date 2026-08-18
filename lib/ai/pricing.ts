import { SUPPORTED_MODELS, DEFAULT_MODEL_ID } from "./models";

export interface CalculateCostParams {
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  cachedInputTokens?: number;
  reasoningTokens?: number;
}

export interface TokenCounts {
  inputTokens: number;
  cachedInputTokens?: number;
  outputTokens: number;
  reasoningTokens?: number;
  totalTokens?: number;
}

export function calculateAICost({
  modelId,
  promptTokens,
  completionTokens,
  cachedInputTokens = 0,
}: CalculateCostParams): number {
  const modelDef = SUPPORTED_MODELS[modelId] || SUPPORTED_MODELS[DEFAULT_MODEL_ID];
  const pricing = modelDef.pricing;

  const uncachedPromptTokens = Math.max(0, promptTokens - cachedInputTokens);

  const inputCost = (uncachedPromptTokens / 1_000_000) * pricing.inputPerMillion;
  const cachedCost =
    (cachedInputTokens / 1_000_000) * (pricing.cachedInputPerMillion ?? pricing.inputPerMillion);
  const outputCost = (completionTokens / 1_000_000) * pricing.outputPerMillion;

  const totalCost = inputCost + cachedCost + outputCost;

  return Math.round(totalCost * 1_000_000) / 1_000_000;
}

export function calculateUsageCost(model: string, counts: TokenCounts): number {
  return calculateAICost({
    modelId: model,
    promptTokens: counts.inputTokens,
    completionTokens: counts.outputTokens,
    cachedInputTokens: counts.cachedInputTokens || 0,
    reasoningTokens: counts.reasoningTokens || 0,
  });
}
