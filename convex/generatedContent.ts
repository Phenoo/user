import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save generated content
export const save = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("essay"),
      v.literal("summary"),
      v.literal("study_guide")
    ),
    prompt: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const contentId = await ctx.db.insert("generatedContent", {
      userId: args.userId,
      type: args.type,
      prompt: args.prompt,
      content: args.content,
      createdAt: Date.now(),
    });
    return contentId;
  },
});

// Get all generated content for a user
export const list = query({
  args: {
    userId: v.string(),
    type: v.optional(
      v.union(
        v.literal("essay"),
        v.literal("summary"),
        v.literal("study_guide")
      )
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("generatedContent")
      .withIndex("by_user_and_type", (q) => q.eq("userId", args.userId));

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const content = await query.order("desc").collect();
    return content;
  },
});

// Get a single generated content item
export const get = query({
  args: {
    contentId: v.id("generatedContent"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contentId);
  },
});

// Delete generated content
export const remove = mutation({
  args: {
    contentId: v.id("generatedContent"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.contentId);
  },
});
