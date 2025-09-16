import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const getUserAssessments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assessments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getAssessmentsByCourseId = query({
  args: { courseId: v.id("courses"), userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assessments")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();
  },
});

export const addAssessment = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    name: v.string(),
    type: v.string(),
    score: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    weight: v.number(),
    date: v.string(),
    feedback: v.optional(v.string()),
    status: v.union(
      v.literal("graded"),
      v.literal("pending"),
      v.literal("upcoming")
    ),
  },
  handler: async (ctx, args) => {
    // Verify the course belongs to the user
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== args.userId) {
      throw new Error("Course not found or access denied");
    }

    return await ctx.db.insert("assessments", {
      createdAt: Date.now(),
      ...args,
    });
  },
});

export const updateAssessment = mutation({
  args: {
    assessmentId: v.id("assessments"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    score: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    weight: v.optional(v.number()),
    date: v.optional(v.string()),
    feedback: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("graded"), v.literal("pending"), v.literal("upcoming"))
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const { assessmentId, ...updates } = args;

    const assessment = await ctx.db.get(assessmentId);
    if (!assessment || assessment.userId !== user._id) {
      throw new Error("Assessment not found or access denied");
    }

    return await ctx.db.patch(assessmentId, updates);
  },
});

export const deleteAssessment = mutation({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment || assessment.userId !== user._id) {
      throw new Error("Assessment not found or access denied");
    }

    return await ctx.db.delete(args.assessmentId);
  },
});
