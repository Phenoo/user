import { streamText, generateText, generateObject } from "ai";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { resolveModel } from "./router";
import { getProviderModel } from "./providers";
import { getFeatureCreditCost, getPlanEntitlements, SubscriptionPlan } from "./entitlements";
import {
  AIAuthenticationError,
  AICreditLimitError,
  AIEntitlementError,
} from "./errors";
import { trackTokenUsage } from "@/lib/ai-token-tracker";

export interface AIGatewayRequest {
  userId?: string;
  userPlan?: SubscriptionPlan;
  feature: string;
  mode?: "standard" | "deep-reasoning";
  courseId?: string;
  courseName?: string;
  courseCode?: string;
  requestedModelId?: string;
  promptVersion?: string;
  abortSignal?: AbortSignal;
  retrievalQuery?: string;
  baseSystem?: string;
  request?: {
    messages?: any[];
    prompt?: string;
    schema?: any;
    maxOutputTokens?: number;
    temperature?: number;
    stopWhen?: any;
    tools?: any;
  };
}

export interface GroundedSource {
  documentId: string;
  documentTitle: string;
  fileName?: string;
  mimeType?: string;
  pageNumber?: number;
  section?: string;
  relevanceScore: number;
}

export interface AIGatewayResult {
  requestId: string;
  modelId: string;
  providerModel: any;
  creditCost: number;
  sources: GroundedSource[];
  systemPrompt?: string;
  maxOutputTokens: number;
  trackUsage: (usage: {
    promptTokens: number;
    completionTokens: number;
    cachedInputTokens?: number;
    reasoningTokens?: number;
  }) => Promise<void>;
  fail: (error: unknown) => Promise<void>;
}

export async function prepareAIGatewayRequest(params: AIGatewayRequest): Promise<AIGatewayResult> {
  const {
    feature,
    mode = "standard",
    courseId,
    courseName,
    requestedModelId,
    retrievalQuery,
    baseSystem,
  } = params;

  const token = await convexAuthNextjsToken();
  if (!token) {
    throw new AIAuthenticationError();
  }

  const user = await fetchQuery(api.users.currentUser, {}, { token });
  if (!user) {
    throw new AIAuthenticationError();
  }

  const userId = user._id;
  const userPlan: SubscriptionPlan =
    user.subscriptionPlan === "STUDENT" || user.subscriptionPlan === "STUDENTPRO"
      ? user.subscriptionPlan
      : "FREE";

  const entitlements = getPlanEntitlements(userPlan);

  if (mode === "deep-reasoning" && !entitlements.allowDeepReasoning) {
    throw new AIEntitlementError("Deep Reasoning mode is restricted to Student Pro subscribers.");
  }

  const { modelId, definition } = resolveModel({
    userPlan,
    mode,
    requestedModelId,
  });

  const providerModel = getProviderModel(definition.provider, modelId);
  const creditCost = getFeatureCreditCost(feature, mode);
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const creditStatus = await fetchMutation(
    (api as any).aiRequests.reserveRequest,
    {
      userId,
      requestId,
      provider: definition.provider,
      model: modelId,
      feature,
      mode,
      courseId,
      courseName,
      promptVersion: params.promptVersion,
    },
    { token }
  );

  if (!creditStatus.allowed) {
    throw new AICreditLimitError(creditStatus.reason);
  }

  let sources: GroundedSource[] = [];
  let groundedSystemPrompt = baseSystem || "";

  // Perform RAG retrieval if courseId, userId, and a query exist
  if (courseId && userId && userId !== "anonymous" && retrievalQuery) {
    try {
      const retrievalResult = await fetchQuery(
        (api as any).courseDocuments.retrieveCourseContext,
        {
          userId,
          courseId,
          query: retrievalQuery,
          limit: 4,
        },
        { token }
      );

      if (retrievalResult && retrievalResult.chunks && retrievalResult.chunks.length > 0) {
        sources = retrievalResult.sources || [];
        const contextText = retrievalResult.chunks
          .map(
            (c: any, idx: number) =>
              `[${idx + 1}] Document: "${c.documentTitle}"${c.pageNumber ? ` (Page ${c.pageNumber})` : ""}\nContent: ${c.content}`
          )
          .join("\n\n");

        groundedSystemPrompt += `\n\n--- RELEVANT COURSE MATERIAL ---\n${contextText}\n\nINSTRUCTIONS: Answer using the course material above whenever relevant. Cite your source numbers like [1], [2] when stating course facts.`;
      }
    } catch (err) {
      console.warn("[AIGateway] Course context retrieval skipped/failed:", err);
    }
  }

  const trackUsage = async (usage: {
    promptTokens: number;
    completionTokens: number;
    cachedInputTokens?: number;
    reasoningTokens?: number;
  }) => {
    if (!userId || userId === "anonymous") return;
    await trackTokenUsage({
      userId,
      requestId,
      token,
      model: modelId,
      feature,
      mode,
      creditsUsed: creditCost,
      courseId,
      courseName,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      cachedInputTokens: usage.cachedInputTokens,
      reasoningTokens: usage.reasoningTokens,
      latencyMs: Date.now() - startedAt,
    });
  };

  const fail = async (error: unknown) => {
    const isCanceled =
      error instanceof Error &&
      (error.name === "AbortError" || error.message.toLowerCase().includes("abort"));

    await trackTokenUsage({
      userId,
      requestId,
      token,
      model: modelId,
      feature,
      mode,
      creditsUsed: creditCost,
      courseId,
      courseName,
      promptTokens: 0,
      completionTokens: 0,
      status: isCanceled ? "canceled" : "error",
      errorCode: error instanceof Error ? error.name : "AI_REQUEST_FAILED",
      latencyMs: Date.now() - startedAt,
    });
  };

  return {
    requestId,
    modelId,
    providerModel,
    creditCost,
    sources,
    systemPrompt: groundedSystemPrompt.trim() || undefined,
    maxOutputTokens: Math.min(
      params.request?.maxOutputTokens ?? entitlements.maxTokensPerRequest,
      entitlements.maxTokensPerRequest
    ),
    trackUsage,
    fail,
  };
}

export async function streamTextWithGateway(params: AIGatewayRequest) {
  const prepared = await prepareAIGatewayRequest(params);

  const options: any = {
    model: prepared.providerModel,
    system: prepared.systemPrompt,
    messages: params.request?.messages || [],
    prompt: params.request?.prompt,
    tools: params.request?.tools,
    stopWhen: params.request?.stopWhen,
    maxOutputTokens: prepared.maxOutputTokens,
    abortSignal: params.abortSignal,
    onFinish: async (event: any) => {
      const usage = event.usage;
      if (usage) {
        const inputTokens = (usage as any).inputTokens ?? (usage as any).promptTokens ?? 0;
        const outputTokens = (usage as any).outputTokens ?? (usage as any).completionTokens ?? 0;
        await prepared.trackUsage({
          promptTokens: inputTokens,
          completionTokens: outputTokens,
        });
      }
    },
    onError: async (event: { error: unknown }) => {
      await prepared.fail(event.error);
    },
  };

  let result;
  try {
    result = streamText(options);
  } catch (error) {
    await prepared.fail(error);
    throw error;
  }

  return {
    result,
    modelId: prepared.modelId,
    creditCost: prepared.creditCost,
    sources: prepared.sources,
  };
}

export async function generateTextWithGateway(params: AIGatewayRequest) {
  const prepared = await prepareAIGatewayRequest(params);

  const options: any = {
    model: prepared.providerModel,
    system: prepared.systemPrompt,
    maxOutputTokens: prepared.maxOutputTokens,
    abortSignal: params.abortSignal,
  };

  if (params.request?.messages && params.request.messages.length > 0) {
    options.messages = params.request.messages;
  } else if (params.request?.prompt) {
    options.prompt = params.request.prompt;
  }

  if (params.request?.temperature !== undefined) {
    options.temperature = params.request.temperature;
  }

  let result;
  try {
    result = await generateText(options);
  } catch (error) {
    await prepared.fail(error);
    throw error;
  }

  const usage = (result as any).usage;
  const inputTokens = usage?.inputTokens ?? usage?.promptTokens ?? 0;
  const outputTokens = usage?.outputTokens ?? usage?.completionTokens ?? 0;

  await prepared.trackUsage({
    promptTokens: inputTokens,
    completionTokens: outputTokens,
  });

  return {
    text: result.text,
    result,
    modelId: prepared.modelId,
    creditCost: prepared.creditCost,
    sources: prepared.sources,
  };
}

export async function generateObjectWithGateway(params: AIGatewayRequest) {
  if (!params.request?.schema) {
    throw new Error("generateObjectWithGateway requires a schema in params.request");
  }

  const prepared = await prepareAIGatewayRequest(params);

  const options: any = {
    model: prepared.providerModel,
    schema: params.request.schema,
    system: prepared.systemPrompt,
    maxOutputTokens: prepared.maxOutputTokens,
    abortSignal: params.abortSignal,
  };

  if (params.request?.messages && params.request.messages.length > 0) {
    options.messages = params.request.messages;
  } else if (params.request?.prompt) {
    options.prompt = params.request.prompt;
  }

  let result;
  try {
    result = await generateObject(options);
  } catch (error) {
    await prepared.fail(error);
    throw error;
  }

  const usage = (result as any).usage;
  const inputTokens = usage?.inputTokens ?? usage?.promptTokens ?? 0;
  const outputTokens = usage?.outputTokens ?? usage?.completionTokens ?? 0;

  await prepared.trackUsage({
    promptTokens: inputTokens,
    completionTokens: outputTokens,
  });

  return {
    object: result.object,
    result,
    modelId: prepared.modelId,
    creditCost: prepared.creditCost,
    sources: prepared.sources,
  };
}
