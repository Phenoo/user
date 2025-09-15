import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
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
