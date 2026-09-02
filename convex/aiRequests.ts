import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { auth } from "./auth";

import {
  getCreditsForRequest,
  getEntitlementsForPlan,
  getMonthlyResetDate,
} from "../lib/ai/entitlements";
import type {
  AIFeature,
  AIRequestMode,
  SubscriptionPlan,
} from "../lib/ai/models";

const AI_RESERVATION_TTL_MS = 15 * 60 * 1000;

function consumesCredits(request: { status: string; createdAt: number }) {
  return (
    request.status === "success" ||
    (request.status === "reserved" &&
      request.createdAt >= Date.now() - AI_RESERVATION_TTL_MS)
  );
}

function getUsageWindow(now = Date.now()) {
  const start = new Date(now);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const resetDate = getMonthlyResetDate(new Date(now));

  return {
    windowStart: start.getTime(),
    resetAt: resetDate.getTime(),
  };
}

async function getUserAndPlan(ctx: any, userId: string) {
  const user = await ctx.db.get(userId as any);

  if (!user) {
    throw new ConvexError("User not found");
  }

  const plan = (user.subscriptionPlan || "FREE") as SubscriptionPlan;

  return {
    user,
    plan,
    entitlements: getEntitlementsForPlan(plan),
  };
}

async function assertCurrentUser(ctx: any, userId: string) {
  const currentUserId = await auth.getUserId(ctx);

  if (!currentUserId) {
    throw new ConvexError("Not authenticated");
  }

  if (currentUserId !== userId) {
    throw new ConvexError("Unauthorized access");
  }
}

async function getCurrentPeriodRequests(ctx: any, userId: string) {
  const { windowStart, resetAt } = getUsageWindow();

  const requests = await ctx.db
    .query("aiRequests")
    .withIndex("by_user_created", (q: any) =>
      q.eq("userId", userId).gte("createdAt", windowStart)
    )
    .collect();

  return {
    requests,
    windowStart,
    resetAt,
  };
}

export const prepareRequest = query({
  args: {
    userId: v.string(),
    feature: v.string(),
    mode: v.optional(
      v.union(v.literal("standard"), v.literal("deep-reasoning"))
    ),
  },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);

    const mode = (args.mode || "standard") as AIRequestMode;
    const feature = args.feature as AIFeature;

    const { plan, entitlements } = await getUserAndPlan(ctx, args.userId);
    const { requests, resetAt } = await getCurrentPeriodRequests(ctx, args.userId);

    const creditsUsed = requests
      .filter(consumesCredits)
      .reduce(
        (sum: number, request: any) => sum + (request.creditsUsed || 0),
        0
      );

    const requestedCredits = getCreditsForRequest(feature, mode);
    const remainingCredits = Math.max(
      0,
      entitlements.ai.monthlyCredits - creditsUsed
    );

    if (mode === "deep-reasoning" && !entitlements.ai.deepReasoning) {
      return {
        allowed: false,
        plan,
        reason: "Deep reasoning is available on the STUDENTPRO plan.",
        creditsUsed,
        remainingCredits,
        requestedCredits,
        resetAt,
      };
    }

    if (remainingCredits < requestedCredits) {
      return {
        allowed: false,
        plan,
        reason: "You've reached your AI credit allowance for this month.",
        creditsUsed,
        remainingCredits,
        requestedCredits,
        resetAt,
      };
    }

    return {
      allowed: true,
      plan,
      creditsUsed,
      remainingCredits,
      requestedCredits,
      resetAt,
    };
  },
});

export const reserveRequest = mutation({
  args: {
    userId: v.string(),
    requestId: v.string(),
    provider: v.union(v.literal("deepseek"), v.literal("openai")),
    model: v.string(),
    feature: v.string(),
    mode: v.optional(
      v.union(v.literal("standard"), v.literal("deep-reasoning"))
    ),
    courseId: v.optional(v.string()),
    courseName: v.optional(v.string()),
    promptVersion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);

    const existing = await ctx.db
      .query("aiRequests")
      .withIndex("by_user_request", (q) =>
        q.eq("userId", args.userId).eq("requestId", args.requestId)
      )
      .unique();

    if (existing) {
      return {
        allowed: existing.status === "reserved" || existing.status === "success",
        requestId: existing.requestId,
        requestedCredits: existing.creditsUsed || 0,
      };
    }

    const mode = (args.mode || "standard") as AIRequestMode;
    const feature = args.feature as AIFeature;
    const { plan, entitlements } = await getUserAndPlan(ctx, args.userId);
    const { requests, resetAt } = await getCurrentPeriodRequests(ctx, args.userId);
    const creditsUsed = requests
      .filter(consumesCredits)
      .reduce(
        (sum: number, request: any) => sum + (request.creditsUsed || 0),
        0
      );
    const requestedCredits = getCreditsForRequest(feature, mode);
    const remainingCredits = Math.max(
      0,
      entitlements.ai.monthlyCredits - creditsUsed
    );

    if (mode === "deep-reasoning" && !entitlements.ai.deepReasoning) {
      return {
        allowed: false,
        plan,
        reason: "Deep reasoning is available on the STUDENTPRO plan.",
        creditsUsed,
        remainingCredits,
        requestedCredits,
        resetAt,
      };
    }

    if (remainingCredits < requestedCredits) {
      return {
        allowed: false,
        plan,
        reason: "You've reached your AI credit allowance for this month.",
        creditsUsed,
        remainingCredits,
        requestedCredits,
        resetAt,
      };
    }

    await ctx.db.insert("aiRequests", {
      ...args,
      mode,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCostUSD: 0,
      creditsUsed: requestedCredits,
      status: "reserved",
      createdAt: Date.now(),
    });

    return {
      allowed: true,
      plan,
      requestId: args.requestId,
      creditsUsed,
      remainingCredits: remainingCredits - requestedCredits,
      requestedCredits,
      resetAt,
    };
  },
});

export const recordRequest = mutation({
  args: {
    userId: v.string(),
    requestId: v.string(),
    provider: v.union(v.literal("deepseek"), v.literal("openai")),
    model: v.string(),
    feature: v.string(),
    mode: v.optional(
      v.union(v.literal("standard"), v.literal("deep-reasoning"))
    ),
    courseId: v.optional(v.string()),
    courseName: v.optional(v.string()),
    promptVersion: v.optional(v.string()),
    inputTokens: v.number(),
    cachedInputTokens: v.optional(v.number()),
    outputTokens: v.number(),
    reasoningTokens: v.optional(v.number()),
    totalTokens: v.number(),
    estimatedCostUSD: v.number(),
    creditsUsed: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    status: v.union(
      v.literal("success"),
      v.literal("error"),
      v.literal("canceled")
    ),
    errorCode: v.optional(v.string()),
    retrievalChunkCount: v.optional(v.number()),
    retrievalLatencyMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);

    const existing = await ctx.db
      .query("aiRequests")
      .withIndex("by_user_request", (q) =>
        q.eq("userId", args.userId).eq("requestId", args.requestId)
      )
      .unique();

    if (existing?.status === "success") {
      return existing._id;
    }

    const now = Date.now();
    const requestId = existing?._id || (await ctx.db.insert("aiRequests", {
      ...args,
      createdAt: now,
    }));

    if (existing) {
      await ctx.db.patch(existing._id, args);
    }

    if (args.status === "success") {
      await ctx.db.insert("aiTokenUsage", {
        userId: args.userId,
        model: args.model,
        feature: args.feature,
        courseId: args.courseId,
        courseName: args.courseName,
        promptTokens: args.inputTokens,
        completionTokens: args.outputTokens,
        totalTokens: args.totalTokens,
        estimatedCostUSD: args.estimatedCostUSD,
        createdAt: now,
      });

      try {
        const userId = args.userId as Id<"users">;
        const user = await ctx.db.get(userId);

        if (user) {
          const existingUsage = await ctx.db
            .query("usageTracking")
            .withIndex("by_user_feature", (q) =>
              q.eq("userId", userId).eq("feature", "AI_GENERATIONS")
            )
            .first();

          if (existingUsage) {
            await ctx.db.patch(existingUsage._id, {
              count: existingUsage.count + 1,
              updatedAt: now,
            });
          } else {
            await ctx.db.insert("usageTracking", {
              userId,
              feature: "AI_GENERATIONS",
              count: 1,
              lastReset: now,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      } catch (error) {
        console.warn("Could not sync AI generation usage:", error);
      }
    }

    return requestId;
  },
});

export const getUsageDashboard = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);

    const { plan, entitlements } = await getUserAndPlan(ctx, args.userId);
    const { requests, windowStart, resetAt } = await getCurrentPeriodRequests(
      ctx,
      args.userId
    );

    const successfulRequests = requests.filter(
      (request: any) => request.status === "success"
    );

    const totals = successfulRequests.reduce(
      (sum: any, request: any) => {
        sum.inputTokens += request.inputTokens || 0;
        sum.cachedInputTokens += request.cachedInputTokens || 0;
        sum.outputTokens += request.outputTokens || 0;
        sum.reasoningTokens += request.reasoningTokens || 0;
        sum.totalTokens += request.totalTokens || 0;
        sum.estimatedCostUSD += request.estimatedCostUSD || 0;
        sum.creditsUsed += request.creditsUsed || 0;
        return sum;
      },
      {
        inputTokens: 0,
        cachedInputTokens: 0,
        outputTokens: 0,
        reasoningTokens: 0,
        totalTokens: 0,
        estimatedCostUSD: 0,
        creditsUsed: 0,
      }
    );

    const featureBreakdown = new Map<string, any>();
    const modelBreakdown = new Map<string, any>();

    for (const request of successfulRequests) {
      const featureStats = featureBreakdown.get(request.feature) ?? {
        feature: request.feature,
        count: 0,
        creditsUsed: 0,
        totalTokens: 0,
        cost: 0,
      };

      featureStats.count += 1;
      featureStats.creditsUsed += request.creditsUsed || 0;
      featureStats.totalTokens += request.totalTokens || 0;
      featureStats.cost += request.estimatedCostUSD || 0;
      featureBreakdown.set(request.feature, featureStats);

      const modelStats = modelBreakdown.get(request.model) ?? {
        model: request.model,
        count: 0,
        totalTokens: 0,
        cost: 0,
      };

      modelStats.count += 1;
      modelStats.totalTokens += request.totalTokens || 0;
      modelStats.cost += request.estimatedCostUSD || 0;
      modelBreakdown.set(request.model, modelStats);
    }

    return {
      plan,
      entitlements,
      windowStart,
      resetAt,
      totalRequests: successfulRequests.length,
      creditsUsed: totals.creditsUsed,
      creditsRemaining: Math.max(
        0,
        entitlements.ai.monthlyCredits - totals.creditsUsed
      ),
      totalInputTokens: totals.inputTokens,
      totalCachedInputTokens: totals.cachedInputTokens,
      totalOutputTokens: totals.outputTokens,
      totalReasoningTokens: totals.reasoningTokens,
      totalTokens: totals.totalTokens,
      totalEstimatedCostUSD: Number(totals.estimatedCostUSD.toFixed(6)),
      featureBreakdown: Array.from(featureBreakdown.values()).sort(
        (a, b) => b.totalTokens - a.totalTokens
      ),
      modelBreakdown: Array.from(modelBreakdown.values()).sort(
        (a, b) => b.totalTokens - a.totalTokens
      ),
      recentRequests: requests
        .slice()
        .sort((a: any, b: any) => b.createdAt - a.createdAt)
        .slice(0, 10),
    };
  },
});
