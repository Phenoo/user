import { fetchMutation } from "convex/nextjs";
import { nanoid } from "nanoid";

import { api } from "@/convex/_generated/api";
import { calculateUsageCost } from "@/lib/ai/pricing";

export interface TrackTokenUsageParams {
  userId: string;
  model?: string;
  feature: string;
  courseId?: string;
  courseName?: string;
  promptTokens: number;
  completionTokens: number;
  cachedInputTokens?: number;
  reasoningTokens?: number;
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
  model = "deepseek-chat",
  feature,
  courseId,
  courseName,
  promptTokens,
  completionTokens,
  cachedInputTokens = 0,
  reasoningTokens = 0,
}: TrackTokenUsageParams): Promise<void> {
  if (!userId) {
    return;
  }

  const totalTokens =
    promptTokens +
    cachedInputTokens +
    completionTokens +
    reasoningTokens;

  try {
    await fetchMutation((api as any).aiRequests.recordRequest, {
      userId,
      requestId: nanoid(),
      provider: model.startsWith("gpt-") ? "openai" : "deepseek",
      model,
      feature,
      mode: "standard",
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
      status: "success",
      creditsUsed: 0,
    });
  } catch (error) {
    console.error(
      `[AI Token Tracker] Failed to record token usage for ${userId}:`,
      error
    );
  }
}
