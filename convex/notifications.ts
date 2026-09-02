import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { auth } from "./auth";

async function requireUserId(ctx: any): Promise<Id<"users">> {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new ConvexError("Not authenticated");
  return userId;
}

export const list = query({
  args: {
    filter: v.optional(
      v.union(v.literal("all"), v.literal("unread"), v.literal("read"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 100);

    if (args.filter === "unread" || args.filter === "read") {
      return await ctx.db
        .query("notifications")
        .withIndex("by_user_read", (q) =>
          q.eq("userId", userId).eq("isRead", args.filter === "read")
        )
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

export const getCounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const [all, unread] = await Promise.all([
      ctx.db
        .query("notifications")
        .withIndex("by_user_created", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("notifications")
        .withIndex("by_user_read", (q) =>
          q.eq("userId", userId).eq("isRead", false)
        )
        .collect(),
    ]);

    return { all: all.length, unread: unread.length, read: all.length - unread.length };
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new ConvexError("Notification not found");
    }
    if (!notification.isRead) {
      await ctx.db.patch(args.notificationId, {
        isRead: true,
        readAt: Date.now(),
      });
    }
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", userId).eq("isRead", false)
      )
      .collect();
    const readAt = Date.now();
    await Promise.all(
      unread.map((notification) =>
        ctx.db.patch(notification._id, { isRead: true, readAt })
      )
    );
    return unread.length;
  },
});

export const refreshReminders = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const userIdString = userId as string;
    const now = Date.now();
    const horizon = now + 7 * 24 * 60 * 60 * 1000;
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const [assignments, events, studyItems] = await Promise.all([
      ctx.db
        .query("assignments")
        .withIndex("by_user", (q) => q.eq("userId", userIdString))
        .collect(),
      ctx.db
        .query("events")
        .withIndex("by_user", (q) => q.eq("userId", userIdString))
        .collect(),
      ctx.db
        .query("studyPlanItems")
        .withIndex("by_user_start", (q) =>
          q.eq("userId", userId).gte("scheduledStart", now).lte("scheduledStart", horizon)
        )
        .collect(),
    ]);

    const candidates: Array<{
      type: "assignment" | "exam" | "study_session";
      title: string;
      message: string;
      actionUrl: string;
      scheduledFor: number;
      dedupKey: string;
    }> = [];

    if (settings?.assignmentReminders !== false) {
      for (const assignment of assignments) {
        const dueAt = assignment.dueDate ? Date.parse(assignment.dueDate) : NaN;
        if (!Number.isFinite(dueAt) || dueAt < now || dueAt > horizon) continue;
        candidates.push({
          type: "assignment",
          title: "Assignment due soon",
          message: `${assignment.title} is due ${new Date(dueAt).toLocaleString()}.`,
          actionUrl: "/dashboard/tasks",
          scheduledFor: dueAt,
          dedupKey: `assignment:${assignment._id}:${dueAt}`,
        });
      }
    }

    if (settings?.examReminders !== false) {
      for (const event of events) {
        if (!/exam|test|quiz/i.test(`${event.title} ${event.description}`)) continue;
        const startsAt = Date.parse(event.startDate);
        if (!Number.isFinite(startsAt) || startsAt < now || startsAt > horizon) continue;
        candidates.push({
          type: "exam",
          title: "Upcoming exam",
          message: `${event.title} starts ${new Date(startsAt).toLocaleString()}.`,
          actionUrl: "/dashboard/schedule",
          scheduledFor: startsAt,
          dedupKey: `exam:${event._id}:${startsAt}`,
        });
      }
    }

    if (settings?.studyReminders !== false) {
      for (const item of studyItems) {
        if (item.status === "completed" || item.status === "skipped") continue;
        candidates.push({
          type: "study_session",
          title: "Study session coming up",
          message: `${item.title} is scheduled for ${new Date(item.scheduledStart).toLocaleString()}.`,
          actionUrl: "/dashboard/schedule",
          scheduledFor: item.scheduledStart,
          dedupKey: `study:${item._id}:${item.scheduledStart}`,
        });
      }
    }

    let created = 0;
    for (const candidate of candidates) {
      const existing = await ctx.db
        .query("notifications")
        .withIndex("by_user_dedup", (q) =>
          q.eq("userId", userId).eq("dedupKey", candidate.dedupKey)
        )
        .unique();
      if (existing) continue;
      await ctx.db.insert("notifications", {
        userId,
        ...candidate,
        isRead: false,
        createdAt: now,
      });
      created += 1;
    }

    return created;
  },
});
