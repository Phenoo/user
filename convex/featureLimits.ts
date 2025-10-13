import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get limit for a specific plan and feature
export const getLimit = query({
  args: {
    plan: v.union(
      v.literal("FREE"),
      v.literal("STUDENT"),
      v.literal("STUDENTPRO")
    ),
    feature: v.string(),
  },
  handler: async (ctx, args) => {
    const limit = await ctx.db
      .query("featureLimits")
      .withIndex("by_plan_feature", (q) =>
        q.eq("plan", args.plan).eq("feature", args.feature)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    return limit;
  },
});

// Get all limits for a plan
export const getLimitsByPlan = query({
  args: {
    plan: v.union(
      v.literal("FREE"),
      v.literal("STUDENT"),
      v.literal("STUDENTPRO")
    ),
  },
  handler: async (ctx, args) => {
    const limits = await ctx.db
      .query("featureLimits")
      .withIndex("by_plan", (q) => q.eq("plan", args.plan))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return limits;
  },
});

// Check if user can perform action
export const canPerformAction = query({
  args: {
    userId: v.id("users"),
    feature: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user's plan
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { allowed: false, reason: "User not found" };
    }

    const plan = user.subscriptionPlan || "FREE";

    // Get the limit for this plan and feature
    const limit = await ctx.db
      .query("featureLimits")
      .withIndex("by_plan_feature", (q) =>
        q.eq("plan", plan).eq("feature", args.feature)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!limit) {
      // No limit defined, allow by default
      return { allowed: true, limit: -1, current: 0 };
    }

    // -1 means unlimited
    if (limit.limit === -1) {
      return { allowed: true, limit: -1, current: 0 };
    }

    // Get current usage
    const featureEnum = args.feature as
      | "COURSES_CREATED"
      | "DECKS_CREATED"
      | "CARDS_CREATED"
      | "AI_GENERATIONS"
      | "DATA_EXPORTS"
      | "ANALYTICS_VIEWS";

    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user_feature", (q) =>
        q.eq("userId", args.userId).eq("feature", featureEnum)
      )
      .first();

    const currentUsage = usage?.count || 0;

    return {
      allowed: currentUsage < limit.limit,
      limit: limit.limit,
      current: currentUsage,
      remaining: Math.max(0, limit.limit - currentUsage),
    };
  },
});

// Create or update a feature limit
export const setLimit = mutation({
  args: {
    plan: v.union(
      v.literal("FREE"),
      v.literal("STUDENT"),
      v.literal("STUDENTPRO")
    ),
    feature: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("featureLimits")
      .withIndex("by_plan_feature", (q) =>
        q.eq("plan", args.plan).eq("feature", args.feature)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        limit: args.limit,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("featureLimits", {
        plan: args.plan,
        feature: args.feature,
        limit: args.limit,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Initialize default limits
export const initializeDefaultLimits = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const defaultLimits = [
      // FREE plan limits
      { plan: "FREE" as const, feature: "COURSES_CREATED", limit: 3 },
      { plan: "FREE" as const, feature: "DECKS_CREATED", limit: 5 },
      { plan: "FREE" as const, feature: "CARDS_CREATED", limit: 50 },
      { plan: "FREE" as const, feature: "AI_GENERATIONS", limit: 10 },
      { plan: "FREE" as const, feature: "DATA_EXPORTS", limit: 1 },
      { plan: "FREE" as const, feature: "ANALYTICS_VIEWS", limit: 5 },

      // STUDENT plan limits
      { plan: "STUDENT" as const, feature: "COURSES_CREATED", limit: 10 },
      { plan: "STUDENT" as const, feature: "DECKS_CREATED", limit: 20 },
      { plan: "STUDENT" as const, feature: "CARDS_CREATED", limit: 200 },
      { plan: "STUDENT" as const, feature: "AI_GENERATIONS", limit: 50 },
      { plan: "STUDENT" as const, feature: "DATA_EXPORTS", limit: 5 },
      { plan: "STUDENT" as const, feature: "ANALYTICS_VIEWS", limit: -1 },

      // STUDENTPRO plan limits (unlimited)
      { plan: "STUDENTPRO" as const, feature: "COURSES_CREATED", limit: -1 },
      { plan: "STUDENTPRO" as const, feature: "DECKS_CREATED", limit: -1 },
      { plan: "STUDENTPRO" as const, feature: "CARDS_CREATED", limit: -1 },
      { plan: "STUDENTPRO" as const, feature: "AI_GENERATIONS", limit: -1 },
      { plan: "STUDENTPRO" as const, feature: "DATA_EXPORTS", limit: -1 },
      { plan: "STUDENTPRO" as const, feature: "ANALYTICS_VIEWS", limit: -1 },
    ];

    for (const limitData of defaultLimits) {
      const existing = await ctx.db
        .query("featureLimits")
        .withIndex("by_plan_feature", (q) =>
          q.eq("plan", limitData.plan).eq("feature", limitData.feature)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("featureLimits", {
          ...limitData,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  },
});
