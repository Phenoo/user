import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user settings
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject as any;

    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return settings;
  },
});

export const createUserSettings = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();

    const settings = await ctx.db.insert("userSettings", {
      userId: args.userId,
      emailNotifications: true,
      pushNotifications: true,
      studyReminders: true,
      reminderTime: "09:00",
      weeklyReport: true,
      pomodoroMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      dailyStudyGoal: 120,
      studyMode: "focused",
      showTimer: true,
      playSound: true,
      gpaScale: "4.0",
      theme: "system",
      language: "en",
      createdAt: now,
      updatedAt: now,
    });

    return settings;
  },
});

// Update user settings
export const updateUserSettings = mutation({
  args: {
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    studyReminders: v.optional(v.boolean()),
    reminderTime: v.optional(v.string()),
    weeklyReport: v.optional(v.boolean()),
    pomodoroMinutes: v.optional(v.number()),
    shortBreakMinutes: v.optional(v.number()),
    longBreakMinutes: v.optional(v.number()),
    sessionsBeforeLongBreak: v.optional(v.number()),
    autoStartBreaks: v.optional(v.boolean()),
    autoStartPomodoros: v.optional(v.boolean()),
    dailyStudyGoal: v.optional(v.number()),
    studyMode: v.optional(
      v.union(
        v.literal("focused"),
        v.literal("relaxed"),
        v.literal("intensive")
      )
    ),
    showTimer: v.optional(v.boolean()),
    playSound: v.optional(v.boolean()),
    gpaTarget: v.optional(v.number()),
    gpaScale: v.optional(v.union(v.literal("4.0"), v.literal("5.0"))),
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
    ),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject as any;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      throw new Error("Settings not found");
    }

    await ctx.db.patch(settings._id, {
      ...args,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete user account
export const deleteUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject as any;

    // Delete user settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (settings) {
      await ctx.db.delete(settings._id);
    }

    // Delete user's flashcard decks
    const decks = await ctx.db
      .query("flashcardDecks")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();

    for (const deck of decks) {
      // Delete all cards in the deck
      const cards = await ctx.db
        .query("flashcards")
        .withIndex("by_deckId", (q) => q.eq("deckId", deck._id))
        .collect();

      for (const card of cards) {
        await ctx.db.delete(card._id);
      }

      await ctx.db.delete(deck._id);
    }

    // Delete user's study sessions
    const sessions = await ctx.db
      .query("studySessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Delete user's courses
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const course of courses) {
      await ctx.db.delete(course._id);
    }

    return { success: true };
  },
});

// Export user data
export const exportUserData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject as any;

    // Get all user data
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const decks = await ctx.db
      .query("flashcardDecks")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();

    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const sessions = await ctx.db
      .query("studySessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const courses = await ctx.db
      .query("courses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return {
      settings,
      decks,
      cards,
      sessions,
      courses,
      exportedAt: new Date().toISOString(),
    };
  },
});
