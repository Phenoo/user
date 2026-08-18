import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    const accounts = await ctx.db
      .query("connectedAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const syncs = await ctx.db
      .query("integrationSyncs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return providerConfig.map((provider) => {
      const account = accounts.find((item) => item.provider === provider.provider);
      const latestSync = syncs
        .filter((item) => item.provider === provider.provider)
        .sort((a, b) => b.startedAt - a.startedAt)[0];

      return {
        ...provider,
        status: account?.status || "disconnected",
        connectedAt: account?.connectedAt,
        lastSyncAt: latestSync?.completedAt || account?.lastSyncAt,
        latestSyncStatus: latestSync?.status,
        latestSyncError: latestSync?.error,
      };
    });
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
    return await ctx.db
      .query("connectedAccounts")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .unique();
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
    refreshToken: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
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
        ...(args.refreshToken ? { refreshToken: args.refreshToken } : {}),
        ...(args.accessToken ? { accessToken: args.accessToken } : {}),
        ...(args.expiresAt ? { expiresAt: args.expiresAt } : {}),
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
      refreshToken: args.refreshToken,
      accessToken: args.accessToken,
      expiresAt: args.expiresAt,
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
