import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const list = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let userId = args?.userId;

    if (!userId) {
      const authUserId = await auth.getUserId(ctx);
      if (authUserId) {
        userId = authUserId;
      }
    }

    if (!userId) {
      // Fallback if no user is specified or authenticated
      return await ctx.db.query("events").collect();
    }

    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    color: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", args);
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.string(),
    description: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    color: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});
