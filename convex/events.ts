import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { auth } from "./auth";

export const list = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) {
      return [];
    }

    if (args.userId && args.userId !== authUserId) {
      throw new ConvexError("Unauthorized access");
    }

    return await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", authUserId))
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
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId || authUserId !== args.userId) {
      throw new ConvexError("Unauthorized access");
    }
    return await ctx.db.insert("events", { ...args, userId: authUserId });
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, { id }) => {
    const event = await ctx.db.get(id);
    const authUserId = await auth.getUserId(ctx);
    if (!event || !authUserId || event.userId !== authUserId) {
      throw new ConvexError("Event not found or unauthorized access");
    }
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
    const event = await ctx.db.get(args.id);
    const authUserId = await auth.getUserId(ctx);
    if (
      !event ||
      !authUserId ||
      event.userId !== authUserId ||
      args.userId !== authUserId
    ) {
      throw new ConvexError("Event not found or unauthorized access");
    }
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});
