import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { calculateUsageCost } from "@/lib/ai/pricing";

export interface TrackTokenUsageParams {
  userId: string;
  requestId: string;
  token: string;
  model?: string;
  feature: string;
  mode?: "standard" | "deep-reasoning";
  creditsUsed: number;
  courseId?: string;
  courseName?: string;
  promptTokens: number;
  completionTokens: number;
  cachedInputTokens?: number;
  reasoningTokens?: number;
  status?: "success" | "error" | "canceled";
  errorCode?: string;
  latencyMs?: number;
}

export function calculateTokenCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  return calculateUsageCost(model, {
    inputTokens: promptTokens,
    cachedInputTokens: 0,
    outputTokens: completionTokens,
    reasoningTokens: 0,
    totalTokens: promptTokens + completionTokens,
  });
}

export async function trackTokenUsage({
  userId,
  requestId,
  token,
  model = "deepseek-chat",
  feature,
  mode = "standard",
  creditsUsed,
  courseId,
  courseName,
  promptTokens,
  completionTokens,
  cachedInputTokens = 0,
  reasoningTokens = 0,
  status = "success",
  errorCode,
  latencyMs,
}: TrackTokenUsageParams): Promise<void> {
  if (!userId) {
    return;
  }

  const totalTokens =
    promptTokens +
    cachedInputTokens +
    completionTokens +
    reasoningTokens;

  await fetchMutation((api as any).aiRequests.recordRequest, {
      userId,
      requestId,
      provider: model.startsWith("gpt-") ? "openai" : "deepseek",
      model,
      feature,
      mode,
      courseId,
      courseName,
      inputTokens: promptTokens,
      cachedInputTokens: cachedInputTokens > 0 ? cachedInputTokens : undefined,
      outputTokens: completionTokens,
      reasoningTokens: reasoningTokens > 0 ? reasoningTokens : undefined,
      totalTokens,
      estimatedCostUSD: calculateUsageCost(model, {
        inputTokens: promptTokens,
        cachedInputTokens,
        outputTokens: completionTokens,
        reasoningTokens,
        totalTokens,
      }),
      status,
      errorCode,
      latencyMs,
      creditsUsed,
    }, { token });
}
