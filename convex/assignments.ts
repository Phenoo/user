import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save a parsed assignment
export const save = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    dueDate: v.optional(v.string()),
    subject: v.optional(v.string()),
    extractedFrom: v.string(),
  },
  handler: async (ctx, args) => {
    const assignmentId = await ctx.db.insert("assignments", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      subject: args.subject,
      extractedFrom: args.extractedFrom,
      createdAt: Date.now(),
    });
    return assignmentId;
  },
});

// Get all assignments for a user
export const list = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return assignments;
  },
});

// Delete an assignment
export const remove = mutation({
  args: {
    assignmentId: v.id("assignments"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.assignmentId);
  },
});
