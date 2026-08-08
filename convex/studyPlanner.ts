import { ConvexError, v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";


const DEFAULT_SESSION_MINUTES = 45;
const DEFAULT_PLAN_DAYS = 7;

function titleCase(input: string) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeTopicName(input: string) {
  return input.trim().toLowerCase();
}

function toDateKey(dateValue: number) {
  return new Date(dateValue).toISOString().slice(0, 10);
}

async function assertCourseAccess(ctx: any, userId: Id<"users">, courseId: Id<"courses">) {
  const course = await ctx.db.get(courseId);

  if (!course || course.userId !== userId) {
    throw new ConvexError("Course not found or unauthorized access");
  }

  return course;
}

async function findOrCreateTopic(
  ctx: any,
  {
    userId,
    courseId,
    name,
    source,
  }: {
    userId: Id<"users">;
    courseId: Id<"courses">;
    name: string;
    source?: string;
  }
) {
  const normalizedName = titleCase(name);
  const existing = await ctx.db
    .query("courseTopics")
    .withIndex("by_user_course_name", (q: any) =>
      q
        .eq("userId", userId)
        .eq("courseId", courseId)
        .eq("name", normalizedName)
    )
    .unique();

  if (existing) {
    return existing;
  }

  const now = Date.now();
  const topicId = await ctx.db.insert("courseTopics", {
    userId,
    courseId,
    name: normalizedName,
    source,
    createdAt: now,
    updatedAt: now,
  });

  return await ctx.db.get(topicId);
}

function deriveTopicCandidates(materials: any[], chunks: any[]) {
  const candidates = new Map<string, number>();

  for (const material of materials) {
    const titleTokens = material.title
      .split(/[^a-zA-Z0-9]+/)
      .map((token: string) => token.trim())
      .filter((token: string) => token.length >= 4);

    for (const token of titleTokens) {
      const normalized = normalizeTopicName(token);
      candidates.set(normalized, (candidates.get(normalized) ?? 0) + 2);
    }
  }

  for (const chunk of chunks) {
    for (const keyword of chunk.keywords || []) {
      const normalized = normalizeTopicName(keyword);

      if (normalized.length < 4) {
        continue;
      }

      candidates.set(normalized, (candidates.get(normalized) ?? 0) + 1);
    }
  }

  return Array.from(candidates.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name]) => titleCase(name));
}

export const syncTopicsFromMaterials = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await assertCourseAccess(ctx, args.userId, args.courseId);

    const materials = await ctx.db
      .query("courseDocuments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    const candidates = deriveTopicCandidates(materials, chunks);
    const createdTopics = [];

    for (const candidate of candidates) {
      const topic = await findOrCreateTopic(ctx, {
        userId: args.userId,
        courseId: args.courseId,
        name: candidate,
        source: "course-material",
      });

      if (topic) {
        createdTopics.push(topic);
      }
    }

    return createdTopics;
  },
});

export const recordTopicMastery = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    topicName: v.string(),
    correctDelta: v.optional(v.number()),
    incorrectDelta: v.optional(v.number()),
    confidenceScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertCourseAccess(ctx, args.userId, args.courseId);

    const topic = await findOrCreateTopic(ctx, {
      userId: args.userId,
      courseId: args.courseId,
      name: args.topicName,
      source: "study-session",
    });

    if (!topic) {
      throw new ConvexError("Topic could not be created.");
    }

    const existing = await ctx.db
      .query("studentTopicMastery")
      .withIndex("by_user_topic", (q) =>
        q.eq("userId", args.userId).eq("topicId", topic._id)
      )
      .unique();

    const now = Date.now();
    const correctDelta = args.correctDelta ?? 0;
    const incorrectDelta = args.incorrectDelta ?? 0;
    const confidenceScore = Math.max(
      0,
      Math.min(100, args.confidenceScore ?? existing?.confidenceScore ?? 50)
    );

    const correctAnswers = (existing?.correctAnswers ?? 0) + correctDelta;
    const incorrectAnswers = (existing?.incorrectAnswers ?? 0) + incorrectDelta;
    const totalAttempts = Math.max(1, correctAnswers + incorrectAnswers);
    const masteryScore = Math.round((correctAnswers / totalAttempts) * 100);

    if (existing) {
      await ctx.db.patch(existing._id, {
        masteryScore,
        confidenceScore,
        correctAnswers,
        incorrectAnswers,
        lastStudiedAt: now,
        nextRecommendedReviewAt: now + 3 * 24 * 60 * 60 * 1000,
        updatedAt: now,
      });

      return existing._id;
    }

    return await ctx.db.insert("studentTopicMastery", {
      userId: args.userId,
      courseId: args.courseId,
      topicId: topic._id,
      masteryScore,
      confidenceScore,
      correctAnswers,
      incorrectAnswers,
      lastStudiedAt: now,
      nextRecommendedReviewAt: now + 3 * 24 * 60 * 60 * 1000,
      updatedAt: now,
    });
  },
});

export const getMasteryOverview = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await assertCourseAccess(ctx, args.userId, args.courseId);

    const records = await ctx.db
      .query("studentTopicMastery")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    const topics = await Promise.all(
      records.map(async (record) => {
        const topic = await ctx.db.get(record.topicId);
        return topic
          ? {
              ...record,
              topicName: topic.name,
            }
          : null;
      })
    );

    const validTopics = topics.filter(Boolean) as Array<any>;
    const overallMastery =
      validTopics.length > 0
        ? Math.round(
            validTopics.reduce((sum, topic) => sum + topic.masteryScore, 0) /
              validTopics.length
          )
        : 0;

    return {
      overallMastery,
      strongTopics: validTopics
        .filter((topic) => topic.masteryScore >= 75)
        .sort((a, b) => b.masteryScore - a.masteryScore)
        .slice(0, 5),
      weakTopics: validTopics
        .sort((a, b) => a.masteryScore - b.masteryScore)
        .slice(0, 5),
      topics: validTopics.sort((a, b) => a.masteryScore - b.masteryScore),
    };
  },
});

export const generateStudyPlan = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.optional(v.id("courses")),
    preferredSessionMinutes: v.optional(v.number()),
    days: v.optional(v.number()),
    addToCalendar: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const days = Math.max(1, Math.min(args.days ?? DEFAULT_PLAN_DAYS, 14));
    const durationMinutes = Math.max(
      20,
      Math.min(args.preferredSessionMinutes ?? DEFAULT_SESSION_MINUTES, 120)
    );
    const now = Date.now();

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found.");
    }

    const courses = args.courseId
      ? [await assertCourseAccess(ctx, args.userId, args.courseId)]
      : await ctx.db
          .query("courses")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .collect();

    const studyPlanId = await ctx.db.insert("studyPlans", {
      userId: args.userId,
      courseId: args.courseId,
      title: args.courseId
        ? `Study plan for ${courses[0]?.name || "course"}`
        : "Weekly study plan",
      status: "active",
      generatedFrom: {
        generatedAt: now,
        preferredSessionMinutes: durationMinutes,
        days,
      },
      createdAt: now,
      updatedAt: now,
    });

    const items: any[] = [];
    let cursor = new Date(now);
    cursor.setHours(18, 0, 0, 0);

    for (const course of courses) {
      if (!course) {
        continue;
      }

      const masteryRecords = await ctx.db
        .query("studentTopicMastery")
        .withIndex("by_user_course", (q) =>
          q.eq("userId", args.userId).eq("courseId", course._id)
        )
        .collect();

      const weakTopics = (
        await Promise.all(
          masteryRecords
            .sort((a, b) => a.masteryScore - b.masteryScore)
            .slice(0, 2)
            .map(async (record) => {
              const topic = await ctx.db.get(record.topicId);
              return topic
                ? {
                    topic,
                    masteryScore: record.masteryScore,
                  }
                : null;
            })
        )
      ).filter(Boolean) as Array<any>;

      const dueAssessments = await ctx.db
        .query("assessments")
        .withIndex("by_userId_courseId", (q) =>
          q.eq("userId", args.userId).eq("courseId", course._id)
        )
        .collect();

      const upcomingAssessments = dueAssessments
        .filter((assessment) => assessment.status !== "graded")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 1);

      const decks = await ctx.db
        .query("flashcardDecks")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .collect();
      const deckIds = new Set(decks.map((deck) => deck._id));
      const dueFlashcards = (
        await ctx.db
          .query("flashcards")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .collect()
      ).filter(
        (card) =>
          deckIds.has(card.deckId) &&
          (!!card.nextReviewDate ? card.nextReviewDate <= now : false)
      );

      for (const weakTopic of weakTopics) {
        items.push({
          courseId: course._id,
          topicId: weakTopic.topic._id,
          title: `${course.code} - Review ${weakTopic.topic.name}`,
          description: `Focused review session for ${weakTopic.topic.name}.`,
          reason: `Recommended because current mastery is ${weakTopic.masteryScore}%.`,
          durationMinutes,
        });
      }

      for (const assessment of upcomingAssessments) {
        items.push({
          courseId: course._id,
          assignmentId: assessment._id,
          title: `${course.code} - ${assessment.name}`,
          description: `Work on ${assessment.type.toLowerCase()} preparation.`,
          reason: `Recommended because ${assessment.name} is upcoming on ${assessment.date}.`,
          durationMinutes,
        });
      }

      if (dueFlashcards.length > 0) {
        items.push({
          courseId: course._id,
          title: `${course.code} - Flashcard review`,
          description: `Review ${dueFlashcards.length} due flashcards.`,
          reason: `Recommended because ${dueFlashcards.length} flashcards are due for review.`,
          durationMinutes: Math.max(20, Math.min(durationMinutes, 30)),
        });
      }
    }

    const trimmedItems = items.slice(0, Math.max(days * 2, 4));
    const createdItems = [];

    for (const item of trimmedItems) {
      if (createdItems.length > 0 && createdItems.length % 2 === 0) {
        cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
      } else if (createdItems.length > 0) {
        cursor = new Date(cursor.getTime() + 75 * 60 * 1000);
      }

      const start = cursor.getTime();
      const end = start + item.durationMinutes * 60 * 1000;

      const studyPlanItemId = await ctx.db.insert("studyPlanItems", {
        userId: args.userId,
        studyPlanId,
        courseId: item.courseId,
        topicId: item.topicId,
        assignmentId: item.assignmentId,
        title: item.title,
        description: item.description,
        reason: item.reason,
        scheduledStart: start,
        scheduledEnd: end,
        durationMinutes: item.durationMinutes,
        status: args.addToCalendar ? "scheduled" : "planned",
        createdAt: now,
        updatedAt: now,
      });

      if (args.addToCalendar) {
        const eventId = await ctx.db.insert("events", {
          title: item.title,
          description: item.description || item.reason || "Study plan session",
          startDate: new Date(start).toISOString(),
          endDate: new Date(end).toISOString(),
          color: "blue",
          userId: args.userId,
        });

        await ctx.db.patch(studyPlanItemId, {
          calendarEventId: eventId,
        });
      }

      createdItems.push(studyPlanItemId);
    }

    return studyPlanId;
  },
});

export const getUpcomingPlanItems = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const limit = Math.max(1, Math.min(args.limit ?? 10, 20));

    const items = await ctx.db
      .query("studyPlanItems")
      .withIndex("by_user_start", (q) => q.eq("userId", args.userId))
      .collect();

    const upcoming = items
      .filter((item) => item.scheduledEnd >= now)
      .sort((a, b) => a.scheduledStart - b.scheduledStart)
      .slice(0, limit);

    return await Promise.all(
      upcoming.map(async (item) => {
        const topic = item.topicId ? await ctx.db.get(item.topicId) : null;
        const course = item.courseId ? await ctx.db.get(item.courseId) : null;
        return {
          ...item,
          topicName: topic?.name,
          courseName: course?.name,
          courseCode: course?.code,
        };
      })
    );
  },
});

export const syncPlanItemToGoogleCalendar = action({
  args: {
    studyPlanItemId: v.id("studyPlanItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.accessToken) {
      throw new Error("Google Calendar access is not available for this account.");
    }

    const item = await ctx.runQuery((api as any).studyPlanner.getPlanItemForSync, {
      studyPlanItemId: args.studyPlanItemId,
    } as any);

    if (!item) {
      throw new Error("Study plan item not found.");
    }

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${identity.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: item.title,
          description: item.description || item.reason || "Study plan session",
          start: {
            dateTime: new Date(item.scheduledStart).toISOString(),
          },
          end: {
            dateTime: new Date(item.scheduledEnd).toISOString(),
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error?.message || "Google Calendar sync failed.");
    }

    await ctx.runMutation((api as any).integrations.upsertConnectedAccount as any, {
      userId: item.userId,
      provider: "google-calendar",
      scopes: ["https://www.googleapis.com/auth/calendar"],
      status: "connected",
      metadata: {
        source: "study-plan-sync",
      },
    });

    await ctx.runMutation((api as any).integrations.recordSync as any, {
      userId: item.userId,
      provider: "google-calendar",
      type: "study-plan-item",
      status: "success",
      startedAt: Date.now(),
      completedAt: Date.now(),
      importedCount: 1,
      updatedCount: 0,
      failedCount: 0,
      metadata: {
        externalEventId: result.id,
      },
    });

    return result;
  },
});

export const getPlanItemForSync = query({
  args: {
    studyPlanItemId: v.id("studyPlanItems"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.studyPlanItemId);
  },
});
