import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get usage for a specific user and feature
export const getUsage = query({
  args: {
    userId: v.id("users"),
    feature: v.union(
      v.literal("COURSES_CREATED"),
      v.literal("DECKS_CREATED"),
      v.literal("CARDS_CREATED"),
      v.literal("AI_GENERATIONS"),
      v.literal("DATA_EXPORTS"),
      v.literal("ANALYTICS_VIEWS")
    ),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user_feature", (q) =>
        q.eq("userId", args.userId).eq("feature", args.feature)
      )
      .first();

    return usage;
  },
});

// Get all usage for a user
export const getAllUsage = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return usage;
  },
});

// Increment usage count
export const incrementUsage = mutation({
  args: {
    userId: v.id("users"),
    feature: v.union(
      v.literal("COURSES_CREATED"),
      v.literal("DECKS_CREATED"),
      v.literal("CARDS_CREATED"),
      v.literal("AI_GENERATIONS"),
      v.literal("DATA_EXPORTS"),
      v.literal("ANALYTICS_VIEWS")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingUsage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user_feature", (q) =>
        q.eq("userId", args.userId).eq("feature", args.feature)
      )
      .first();

    if (existingUsage) {
      // Check if we need to reset (monthly reset)
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
      if (existingUsage.lastReset < oneMonthAgo) {
        // Reset the counter
        await ctx.db.patch(existingUsage._id, {
          count: 1,
          lastReset: now,
          updatedAt: now,
        });
      } else {
        // Increment the counter
        await ctx.db.patch(existingUsage._id, {
          count: existingUsage.count + 1,
          updatedAt: now,
        });
      }
    } else {
      // Create new usage tracking
      await ctx.db.insert("usageTracking", {
        userId: args.userId,
        feature: args.feature,
        count: 1,
        lastReset: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Reset usage for a specific feature
export const resetUsage = mutation({
  args: {
    userId: v.id("users"),
    feature: v.union(
      v.literal("COURSES_CREATED"),
      v.literal("DECKS_CREATED"),
      v.literal("CARDS_CREATED"),
      v.literal("AI_GENERATIONS"),
      v.literal("DATA_EXPORTS"),
      v.literal("ANALYTICS_VIEWS")
    ),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_user_feature", (q) =>
        q.eq("userId", args.userId).eq("feature", args.feature)
      )
      .first();

    if (usage) {
      await ctx.db.patch(usage._id, {
        count: 0,
        lastReset: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
