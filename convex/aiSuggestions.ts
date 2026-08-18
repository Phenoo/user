import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserSuggestions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Get suggestions stored in DB if any
    const dbSuggestions = await ctx.db
      .query("aiSuggestions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    if (dbSuggestions.length > 0) {
      return dbSuggestions;
    }

    // Otherwise compute dynamic recommendations based on real user data
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("completed"), false))
      .collect();

    const flashcards = await ctx.db
      .query("flashcards")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const unmasteredCards = flashcards.filter((c) => !c.isMastered);

    const generatedSuggestions = [];

    if (unmasteredCards.length > 0) {
      generatedSuggestions.push({
        _id: "review-unmastered",
        title: "Review Unmastered Flashcards",
        description: `You have ${unmasteredCards.length} flashcards that need practice. Short 15-minute daily reviews boost long-term retention.`,
        priority: "HIGH" as const,
        type: "WEAK_AREAS" as const,
        actionable: true,
        isRead: false,
        isImplemented: false,
        createdAt: Date.now(),
      });
    }

    if (tasks.length > 0) {
      generatedSuggestions.push({
        _id: "pending-tasks",
        title: "Focus on Upcoming Tasks",
        description: `You have ${tasks.length} pending tasks. Prioritize high-priority items using Pomodoro focus sessions.`,
        priority: "MEDIUM" as const,
        type: "STUDY_SCHEDULE" as const,
        actionable: true,
        isRead: false,
        isImplemented: false,
        createdAt: Date.now(),
      });
    }

    if (courses.length === 0) {
      generatedSuggestions.push({
        _id: "add-courses",
        title: "Set Up Your Academic Courses",
        description: "Add your enrolled courses to track assessments, GPA, and flashcard decks.",
        priority: "HIGH" as const,
        type: "GOAL_SETTING" as const,
        actionable: true,
        isRead: false,
        isImplemented: false,
        createdAt: Date.now(),
      });
    } else {
      generatedSuggestions.push({
        _id: "pomodoro-habit",
        title: "Optimize Pomodoro Sessions",
        description: "Studying in 25-minute sprints with 5-minute breaks improves focus by up to 35%.",
        priority: "LOW" as const,
        type: "STUDY_METHOD" as const,
        actionable: true,
        isRead: false,
        isImplemented: false,
        createdAt: Date.now(),
      });
    }

    return generatedSuggestions;
  },
});

export const createSuggestion = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("STUDY_SCHEDULE"),
      v.literal("WEAK_AREAS"),
      v.literal("DECK_RECOMMENDATION"),
      v.literal("STUDY_METHOD"),
      v.literal("GOAL_SETTING"),
      v.literal("PERFORMANCE_INSIGHT")
    ),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
    actionable: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiSuggestions", {
      ...args,
      metadata: {},
      isRead: false,
      isImplemented: false,
      createdAt: Date.now(),
    });
  },
});
