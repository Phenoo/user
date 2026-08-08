import { streamText, generateText, generateObject } from "ai";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { resolveModel } from "./router";
import { getProviderModel } from "./providers";
import { getFeatureCreditCost, getPlanEntitlements, SubscriptionPlan } from "./entitlements";
import { AIEntitlementError } from "./errors";
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
  modelId: string;
  providerModel: any;
  creditCost: number;
  sources: GroundedSource[];
  systemPrompt?: string;
  trackUsage: (usage: {
    promptTokens: number;
    completionTokens: number;
    cachedInputTokens?: number;
    reasoningTokens?: number;
  }) => Promise<void>;
}

export async function prepareAIGatewayRequest(params: AIGatewayRequest): Promise<AIGatewayResult> {
  const {
    userId = "anonymous",
    userPlan = "FREE",
    feature,
    mode = "standard",
    courseId,
    courseName,
    requestedModelId,
    retrievalQuery,
    baseSystem,
  } = params;

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
        }
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
      model: modelId,
      feature,
      courseId,
      courseName,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      cachedInputTokens: usage.cachedInputTokens,
      reasoningTokens: usage.reasoningTokens,
    });
  };

  return {
    modelId,
    providerModel,
    creditCost,
    sources,
    systemPrompt: groundedSystemPrompt.trim() || undefined,
    trackUsage,
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
  };

  const result = streamText(options);

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
  };

  if (params.request?.messages && params.request.messages.length > 0) {
    options.messages = params.request.messages;
  } else if (params.request?.prompt) {
    options.prompt = params.request.prompt;
  }

  if (params.request?.temperature !== undefined) {
    options.temperature = params.request.temperature;
  }

  const result = await generateText(options);

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
  const prepared = await prepareAIGatewayRequest(params);

  if (!params.request?.schema) {
    throw new Error("generateObjectWithGateway requires a schema in params.request");
  }

  const options: any = {
    model: prepared.providerModel,
    schema: params.request.schema,
    system: prepared.systemPrompt,
  };

  if (params.request?.messages && params.request.messages.length > 0) {
    options.messages = params.request.messages;
  } else if (params.request?.prompt) {
    options.prompt = params.request.prompt;
  }

  const result = await generateObject(options);

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
