import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    isOnboarding: v.optional(v.boolean()),
    school: v.optional(v.string()),
    course: v.optional(v.string()),
    year: v.optional(v.string()),
    major: v.optional(v.string()),
    location: v.optional(v.string()),
    challenges: v.optional(v.array(v.string())),
    shortTermGoal: v.optional(v.string()),
    longTermGoal: v.optional(v.string()),
    reminderPreference: v.optional(v.string()),
    studyTime: v.optional(v.string()),
    name: v.optional(v.string()),
    schoolEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingUser = await ctx.db.get(args.userId);
    if (!existingUser) {
      return {
        success: false,
        message: "User not found",
      };
    }
    // If a profile already exists for this email, update it

    if (existingUser) {
      const { userId, ...data } = args;

      await ctx.db.patch(existingUser._id, data);
      return {
        success: true,
        message: "User details updated successfully",
      };
    } else {
      return {
        success: false,
        message: "User details not found",
      };
    }
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
