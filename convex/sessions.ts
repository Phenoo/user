import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    courseId: v.id("courses"),
    type: v.union(
      v.literal("pomodoro"),
      v.literal("shortBreak"),
      v.literal("longBreak")
    ),
    duration: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("pomodoroSessions", {
      courseId: args.courseId,
      type: args.type,
      duration: args.duration,
      completedAt: Date.now(),
      userId: args.userId,
    });
    return sessionId;
  },
});

export const listByCourse = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pomodoroSessions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

export const listByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("pomodoroSessions")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.gte(q.field("completedAt"), args.startDate),
          q.lte(q.field("completedAt"), args.endDate)
        )
      )
      .collect();

    // Fetch course data for each session
    const sessionsWithCourses = await Promise.all(
      sessions.map(async (session) => {
        const course = await ctx.db.get(session.courseId);
        return {
          ...session,
          course,
        };
      })
    );

    return sessionsWithCourses;
  },
});

export const getTodayStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("pomodoroSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))

      .filter((q) =>
        q.and(
          q.gte(q.field("completedAt"), startOfDay),
          q.lt(q.field("completedAt"), endOfDay)
        )
      )
      .collect();

    const pomodorosCompleted = sessions.filter(
      (s) => s.type === "pomodoro"
    ).length;
    const totalMinutes = sessions
      .filter((s) => s.type === "pomodoro")
      .reduce((sum, s) => sum + s.duration, 0);

    return {
      pomodorosCompleted,
      totalMinutes,
    };
  },
});

export const getWeeklyStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const sessions = await ctx.db
      .query("pomodoroSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("completedAt"), startOfWeek.getTime()))
      .collect();

    // Group by day
    const dailyHours: number[] = [0, 0, 0, 0, 0, 0, 0];

    sessions
      .filter((s) => s.type === "pomodoro")
      .forEach((session) => {
        const sessionDate = new Date(session.completedAt);
        const dayIndex = sessionDate.getDay();
        dailyHours[dayIndex] += session.duration / 60;
      });

    const totalHours = dailyHours.reduce((sum, hours) => sum + hours, 0);

    return {
      dailyHours,
      totalHours,
    };
  },
});
