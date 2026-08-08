import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Record AI token usage for a user
export const recordUsage = mutation({
  args: {
    userId: v.string(),
    model: v.string(),
    feature: v.string(),
    courseId: v.optional(v.string()),
    courseName: v.optional(v.string()),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    estimatedCostUSD: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const id = await ctx.db.insert("aiTokenUsage", {
      userId: args.userId,
      model: args.model,
      feature: args.feature,
      courseId: args.courseId,
      courseName: args.courseName,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      totalTokens: args.totalTokens,
      estimatedCostUSD: args.estimatedCostUSD,
      createdAt: now,
    });

    // Also update feature limits tracking if applicable
    try {
      // Find user in users table by ID or string
      const user = await ctx.db
        .query("users")
        .filter((q) =>
          q.or(
            q.eq(q.field("_id"), args.userId as any),
            q.eq(q.field("email"), args.userId)
          )
        )
        .first();

      if (user) {
        const existingUsage = await ctx.db
          .query("usageTracking")
          .withIndex("by_user_feature", (q) =>
            q.eq("userId", user._id).eq("feature", "AI_GENERATIONS")
          )
          .first();

        if (existingUsage) {
          await ctx.db.patch(existingUsage._id, {
            count: existingUsage.count + 1,
            updatedAt: now,
          });
        } else {
          await ctx.db.insert("usageTracking", {
            userId: user._id,
            feature: "AI_GENERATIONS",
            count: 1,
            lastReset: now,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    } catch (err) {
      console.warn("Could not sync with usageTracking:", err);
    }

    return id;
  },
});

// Get AI token usage statistics for a single user
export const getUserTokenStats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("aiTokenUsage")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalTokens = 0;
    let totalEstimatedCostUSD = 0;

    const featureBreakdown: Record<
      string,
      { count: number; promptTokens: number; completionTokens: number; totalTokens: number; cost: number }
    > = {};

    const modelBreakdown: Record<
      string,
      { count: number; totalTokens: number; cost: number }
    > = {};

    for (const record of records) {
      totalPromptTokens += record.promptTokens;
      totalCompletionTokens += record.completionTokens;
      totalTokens += record.totalTokens;
      totalEstimatedCostUSD += record.estimatedCostUSD;

      // Breakdown by feature
      if (!featureBreakdown[record.feature]) {
        featureBreakdown[record.feature] = {
          count: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0,
        };
      }
      featureBreakdown[record.feature].count += 1;
      featureBreakdown[record.feature].promptTokens += record.promptTokens;
      featureBreakdown[record.feature].completionTokens += record.completionTokens;
      featureBreakdown[record.feature].totalTokens += record.totalTokens;
      featureBreakdown[record.feature].cost += record.estimatedCostUSD;

      // Breakdown by model
      if (!modelBreakdown[record.model]) {
        modelBreakdown[record.model] = { count: 0, totalTokens: 0, cost: 0 };
      }
      modelBreakdown[record.model].count += 1;
      modelBreakdown[record.model].totalTokens += record.totalTokens;
      modelBreakdown[record.model].cost += record.estimatedCostUSD;
    }

    return {
      totalGenerations: records.length,
      totalPromptTokens,
      totalCompletionTokens,
      totalTokens,
      totalEstimatedCostUSD: Number(totalEstimatedCostUSD.toFixed(6)),
      featureBreakdown: Object.entries(featureBreakdown).map(([feature, stats]) => ({
        feature,
        ...stats,
        cost: Number(stats.cost.toFixed(6)),
      })),
      modelBreakdown: Object.entries(modelBreakdown).map(([model, stats]) => ({
        model,
        ...stats,
        cost: Number(stats.cost.toFixed(6)),
      })),
      recentLogs: records
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10),
    };
  },
});

// Get global system token usage analytics
export const getGlobalTokenStats = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("aiTokenUsage").collect();

    let totalTokens = 0;
    let totalCostUSD = 0;
    const userTokens: Record<string, { totalTokens: number; cost: number; count: number }> = {};

    for (const record of records) {
      totalTokens += record.totalTokens;
      totalCostUSD += record.estimatedCostUSD;

      if (!userTokens[record.userId]) {
        userTokens[record.userId] = { totalTokens: 0, cost: 0, count: 0 };
      }
      userTokens[record.userId].totalTokens += record.totalTokens;
      userTokens[record.userId].cost += record.estimatedCostUSD;
      userTokens[record.userId].count += 1;
    }

    const topUsers = Object.entries(userTokens)
      .map(([userId, stats]) => ({
        userId,
        ...stats,
        cost: Number(stats.cost.toFixed(6)),
      }))
      .sort((a, b) => b.totalTokens - a.totalTokens)
      .slice(0, 10);

    return {
      totalGenerations: records.length,
      totalTokens,
      totalCostUSD: Number(totalCostUSD.toFixed(4)),
      uniqueUsersCount: Object.keys(userTokens).length,
      topUsers,
    };
  },
});
