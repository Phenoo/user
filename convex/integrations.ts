import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { auth } from "./auth";
import type { Id } from "./_generated/dataModel";

async function assertCurrentUser(
  ctx: QueryCtx | MutationCtx,
  userId?: Id<"users">
) {
  const currentUserId = await auth.getUserId(ctx);
  if (!currentUserId || (userId && currentUserId !== userId)) {
    throw new ConvexError("Unauthorized access");
  }
  return currentUserId;
}

const providerConfig = [
  {
    provider: "google-calendar",
    name: "Google Calendar",
    description: "Add study sessions and deadlines to your calendar.",
  },
  {
    provider: "google-drive",
    name: "Google Drive",
    description: "Import lecture notes and materials from Drive.",
  },
  {
    provider: "google-classroom",
    name: "Google Classroom",
    description: "Sync courses, assignments, and class resources.",
  },
  {
    provider: "canvas",
    name: "Canvas LMS",
    description: "Import coursework and deadlines from Canvas.",
  },
  {
    provider: "onedrive",
    name: "OneDrive",
    description: "Import study material from Microsoft storage.",
  },
  {
    provider: "microsoft-education",
    name: "Microsoft Education",
    description: "Connect classes, assignments, and coursework.",
  },
] as const;

export const listAvailable = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);

    const accounts = await ctx.db
      .query("connectedAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return await Promise.all(providerConfig.map(async (provider) => {
      const account = accounts.find((item) => item.provider === provider.provider);
      const latestSync = await ctx.db
        .query("integrationSyncs")
        .withIndex("by_user_provider", (q) =>
          q.eq("userId", args.userId).eq("provider", provider.provider)
        )
        .order("desc")
        .first();

      return {
        ...provider,
        status: account?.status || "disconnected",
        connectedAt: account?.connectedAt,
        lastSyncAt: latestSync?.completedAt || account?.lastSyncAt,
        latestSyncStatus: latestSync?.status,
        latestSyncError: latestSync?.error,
      };
    }));
  },
});

export const getConnectedAccount = query({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("google-calendar"),
      v.literal("google-drive"),
      v.literal("google-classroom"),
      v.literal("canvas"),
      v.literal("microsoft-education"),
      v.literal("onedrive")
    ),
  },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);
    const account = await ctx.db
      .query("connectedAccounts")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .unique();

    if (!account) {
      return null;
    }

    const {
      accessToken: _accessToken,
      refreshToken: _refreshToken,
      ...safeAccount
    } = account;
    return safeAccount;
  },
});

export const upsertConnectedAccount = mutation({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("google-calendar"),
      v.literal("google-drive"),
      v.literal("google-classroom"),
      v.literal("canvas"),
      v.literal("microsoft-education"),
      v.literal("onedrive")
    ),
    externalAccountId: v.optional(v.string()),
    email: v.optional(v.string()),
    scopes: v.array(v.string()),
    status: v.union(
      v.literal("connected"),
      v.literal("needs_reauth"),
      v.literal("disconnected")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);

    const existing = await ctx.db
      .query("connectedAccounts")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        externalAccountId: args.externalAccountId,
        email: args.email,
        scopes: args.scopes,
        status: args.status,
        accessToken: undefined,
        refreshToken: undefined,
        expiresAt: undefined,
        metadata: args.metadata,
        lastSyncAt: existing.lastSyncAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("connectedAccounts", {
      userId: args.userId,
      provider: args.provider,
      externalAccountId: args.externalAccountId,
      email: args.email,
      scopes: args.scopes,
      status: args.status,
      connectedAt: Date.now(),
      metadata: args.metadata,
    });
  },
});

export const recordSync = mutation({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("google-calendar"),
      v.literal("google-drive"),
      v.literal("google-classroom"),
      v.literal("canvas"),
      v.literal("microsoft-education"),
      v.literal("onedrive")
    ),
    type: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("success"),
      v.literal("failed")
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    importedCount: v.optional(v.number()),
    updatedCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
    error: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);

    const syncId = await ctx.db.insert("integrationSyncs", args);

    const account = await ctx.db
      .query("connectedAccounts")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .unique();

    if (account && args.status === "success" && args.completedAt) {
      await ctx.db.patch(account._id, {
        lastSyncAt: args.completedAt,
      });
    }

    return syncId;
  },
});

export const sanitizeStoredTokens = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await assertCurrentUser(ctx);
    const accounts = await ctx.db
      .query("connectedAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const accountsWithTokens = accounts.filter(
      (account) => account.accessToken || account.refreshToken || account.expiresAt
    );

    await Promise.all(
      accountsWithTokens.map((account) =>
        ctx.db.patch(account._id, {
          accessToken: undefined,
          refreshToken: undefined,
          expiresAt: undefined,
        })
      )
    );

    return accountsWithTokens.length;
  },
});

export const getGoogleCredentials = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);
    return await ctx.db
      .query("googleCredentials")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const upsertGoogleCredentials = mutation({
  args: {
    userId: v.id("users"),
    encryptedCredentials: v.string(),
    scopes: v.array(v.string()),
    email: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);
    const existing = await ctx.db
      .query("googleCredentials")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    const credentialData = {
      encryptedCredentials: args.encryptedCredentials,
      scopes: args.scopes,
      email: args.email,
      expiresAt: args.expiresAt,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, credentialData);
      return existing._id;
    }

    return await ctx.db.insert("googleCredentials", {
      userId: args.userId,
      ...credentialData,
    });
  },
});

export const clearGoogleCredentials = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);
    const existing = await ctx.db
      .query("googleCredentials")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }

    return false;
  },
});

export const syncClassroomCourse = mutation({
  args: {
    course: v.object({
      id: v.string(),
      name: v.string(),
      section: v.optional(v.string()),
      description: v.optional(v.string()),
      alternateLink: v.optional(v.string()),
      updateTime: v.optional(v.string()),
    }),
    courseWork: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        dueDate: v.optional(v.string()),
        alternateLink: v.optional(v.string()),
        updateTime: v.optional(v.string()),
      })
    ),
    materials: v.array(
      v.object({
        externalId: v.string(),
        title: v.string(),
        url: v.string(),
        mimeType: v.optional(v.string()),
        description: v.optional(v.string()),
        updateTime: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await assertCurrentUser(ctx);
    const now = Date.now();
    const currentDate = new Date(now);
    const currentYear = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth() + 1;
    const academicYear =
      month >= 9
        ? `${currentYear}-${currentYear + 1}`
        : `${currentYear - 1}-${currentYear}`;
    const session = month >= 9 ? "Fall" : month >= 6 ? "Summer" : "Spring";

    const existingCourse = await ctx.db
      .query("courses")
      .withIndex("by_user_source_external", (q) =>
        q
          .eq("userId", userId)
          .eq("source", "google-classroom")
          .eq("externalId", args.course.id)
      )
      .unique();

    let courseId: Id<"courses">;
    let courseCreated = false;
    if (existingCourse) {
      courseId = existingCourse._id;
      await ctx.db.patch(courseId, {
        name: args.course.name,
        description: args.course.description,
        lmsLink: args.course.alternateLink,
        externalUpdatedAt: args.course.updateTime,
        status: "active",
      });
    } else {
      courseCreated = true;
      courseId = await ctx.db.insert("courses", {
        userId,
        name: args.course.name,
        code:
          args.course.section?.trim() ||
          `GC-${args.course.id.slice(-8).toUpperCase()}`,
        academicYear,
        session,
        instructor: "Google Classroom",
        credits: 0,
        description: args.course.description,
        lmsLink: args.course.alternateLink,
        source: "google-classroom",
        externalId: args.course.id,
        externalUpdatedAt: args.course.updateTime,
        status: "active",
      });
    }

    let assignmentsCreated = 0;
    let assignmentsUpdated = 0;
    let materialsCreated = 0;
    let materialsUpdated = 0;

    for (const courseWork of args.courseWork) {
      const externalId = `${args.course.id}:${courseWork.id}`;
      const existingAssignment = await ctx.db
        .query("assignments")
        .withIndex("by_user_source_external", (q) =>
          q
            .eq("userId", userId)
            .eq("source", "google-classroom")
            .eq("externalId", externalId)
        )
        .unique();
      const assignmentData = {
        userId,
        courseId,
        title: courseWork.title,
        description: courseWork.description || "",
        dueDate: courseWork.dueDate,
        subject: args.course.name,
        extractedFrom: "google-classroom",
        source: "google-classroom" as const,
        externalId,
        externalUpdatedAt: courseWork.updateTime,
        alternateLink: courseWork.alternateLink,
        updatedAt: now,
      };

      if (existingAssignment) {
        await ctx.db.patch(existingAssignment._id, assignmentData);
        assignmentsUpdated += 1;
      } else {
        await ctx.db.insert("assignments", {
          ...assignmentData,
          createdAt: now,
        });
        assignmentsCreated += 1;
      }

      if (courseWork.dueDate) {
        const existingEvent = await ctx.db
          .query("events")
          .withIndex("by_user_source_external", (q) =>
            q
              .eq("userId", userId)
              .eq("source", "google-classroom")
              .eq("externalId", externalId)
          )
          .unique();
        const startTime = new Date(courseWork.dueDate).getTime();
        const eventData = {
          title: `${args.course.name}: ${courseWork.title}`,
          description: courseWork.description || "Google Classroom deadline",
          startDate: courseWork.dueDate,
          endDate: new Date(startTime + 60 * 60 * 1000).toISOString(),
          color: "border-l-emerald-500",
          userId,
          courseId,
          source: "google-classroom" as const,
          externalId,
          lmsLink: courseWork.alternateLink,
        };

        if (existingEvent) {
          await ctx.db.patch(existingEvent._id, eventData);
        } else {
          await ctx.db.insert("events", eventData);
        }
      }
    }

    for (const material of args.materials) {
      const existingMaterial = await ctx.db
        .query("courseDocuments")
        .withIndex("by_user_source_external", (q) =>
          q
            .eq("userId", userId)
            .eq("source", "google-classroom")
            .eq("externalId", material.externalId)
        )
        .unique();
      const materialData = {
        userId,
        courseId,
        title: material.title,
        mimeType: material.mimeType,
        source: "google-classroom" as const,
        processingStatus: "ready" as const,
        textContent: material.description,
        chunkCount: 0,
        fileUrl: material.url,
        externalId: material.externalId,
        externalUpdatedAt: material.updateTime,
        updatedAt: now,
      };

      if (existingMaterial) {
        await ctx.db.patch(existingMaterial._id, materialData);
        materialsUpdated += 1;
      } else {
        await ctx.db.insert("courseDocuments", {
          ...materialData,
          createdAt: now,
        });
        materialsCreated += 1;
      }
    }

    return {
      courseId,
      courseCreated,
      assignmentsCreated,
      assignmentsUpdated,
      materialsCreated,
      materialsUpdated,
    };
  },
});
