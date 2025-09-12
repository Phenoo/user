import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all study groups
export const getAllStudyGroups = query({
  handler: async (ctx) => {
    const groups = await ctx.db
      .query("studyGroups")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return await Promise.all(
      groups.map(async (group) => {
        const course = await ctx.db.get(group.courseId);
        const organizer = await ctx.db.get(group.organizerId);
        return { ...group, course, organizer };
      })
    );
  },
});

// Get user's study groups
export const getUserStudyGroups = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("studyGroupMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.studyGroupId);
        const course = group ? await ctx.db.get(group.courseId) : null;
        return { ...group, course, membership };
      })
    );
  },
});

// Create study group
export const createStudyGroup = mutation({
  args: {
    name: v.string(),
    courseId: v.id("courses"),
    description: v.string(),
    organizerId: v.id("users"),
    maxMembers: v.number(),
    meetingType: v.union(
      v.literal("In-Person"),
      v.literal("Online"),
      v.literal("Hybrid")
    ),
    location: v.string(),
    meetingSchedule: v.string(),
    googleCalendarLink: v.optional(v.string()),
    zoomLink: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const groupId = await ctx.db.insert("studyGroups", {
      ...args,
      currentMembers: 1,
      rating: 0,
      ratingCount: 0,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add organizer as member
    await ctx.db.insert("studyGroupMembers", {
      studyGroupId: groupId,
      userId: args.organizerId,
      role: "organizer",
      joinedAt: Date.now(),
      contributions: 0,
      isActive: true,
    });

    return groupId;
  },
});

// Join study group
export const joinStudyGroup = mutation({
  args: {
    studyGroupId: v.id("studyGroups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.studyGroupId);
    if (!group) throw new Error("Study group not found");

    if (group.currentMembers >= group.maxMembers) {
      throw new Error("Study group is full");
    }

    const existingMembership = await ctx.db
      .query("studyGroupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("studyGroupId", args.studyGroupId).eq("userId", args.userId)
      )
      .first();

    if (existingMembership) {
      throw new Error("User already in this study group");
    }

    await ctx.db.insert("studyGroupMembers", {
      studyGroupId: args.studyGroupId,
      userId: args.userId,
      role: "member",
      joinedAt: Date.now(),
      contributions: 0,
      isActive: true,
    });

    // Update member count
    await ctx.db.patch(args.studyGroupId, {
      currentMembers: group.currentMembers + 1,
    });

    return true;
  },
});

// Get study group by ID with full details
export const getStudyGroup = query({
  args: { groupId: v.id("studyGroups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) return null;

    const course = await ctx.db.get(group.courseId);
    const organizer = await ctx.db.get(group.organizerId);

    const members = await ctx.db
      .query("studyGroupMembers")
      .withIndex("by_group", (q) => q.eq("studyGroupId", args.groupId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return { ...member, user };
      })
    );

    return { ...group, course, organizer, members: membersWithDetails };
  },
});

// Get study group messages
export const getGroupMessages = query({
  args: { groupId: v.id("studyGroups") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("studyGroupMessages")
      .withIndex("by_group_time", (q) => q.eq("studyGroupId", args.groupId))
      .order("desc")
      .take(50);

    return await Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.userId);
        return { ...message, user };
      })
    );
  },
});

// Send message to study group
export const sendMessage = mutation({
  args: {
    studyGroupId: v.id("studyGroups"),
    userId: v.id("users"),
    message: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("file"),
      v.literal("link")
    ),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("studyGroupMessages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Get study group resources
export const getGroupResources = query({
  args: { groupId: v.id("studyGroups") },
  handler: async (ctx, args) => {
    const resources = await ctx.db
      .query("studyGroupResources")
      .withIndex("by_group", (q) => q.eq("studyGroupId", args.groupId))
      .collect();

    return await Promise.all(
      resources.map(async (resource) => {
        const uploader = await ctx.db.get(resource.uploadedBy);
        return { ...resource, uploader };
      })
    );
  },
});

// Add resource to study group
export const addResource = mutation({
  args: {
    studyGroupId: v.id("studyGroups"),
    uploadedBy: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("pdf"),
      v.literal("doc"),
      v.literal("link"),
      v.literal("video")
    ),
    url: v.string(),
    size: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("studyGroupResources", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Leave study group
export const leaveStudyGroup = mutation({
  args: {
    studyGroupId: v.id("studyGroups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("studyGroupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("studyGroupId", args.studyGroupId).eq("userId", args.userId)
      )
      .first();

    if (!membership) throw new Error("User not in this study group");

    await ctx.db.patch(membership._id, { isActive: false });

    // Update member count
    const group = await ctx.db.get(args.studyGroupId);
    if (group) {
      await ctx.db.patch(args.studyGroupId, {
        currentMembers: Math.max(0, group.currentMembers - 1),
      });
    }

    return true;
  },
});

// Update study group
export const updateStudyGroup = mutation({
  args: {
    groupId: v.id("studyGroups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    maxMembers: v.optional(v.number()),
    meetingType: v.optional(
      v.union(v.literal("In-Person"), v.literal("Online"), v.literal("Hybrid"))
    ),
    location: v.optional(v.string()),
    meetingSchedule: v.optional(v.string()),
    googleCalendarLink: v.optional(v.string()),
    zoomLink: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { groupId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(groupId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Delete study group
export const deleteStudyGroup = mutation({
  args: { groupId: v.id("studyGroups") },
  handler: async (ctx, args) => {
    // Mark group as inactive
    await ctx.db.patch(args.groupId, { isActive: false });

    // Mark all memberships as inactive
    const memberships = await ctx.db
      .query("studyGroupMembers")
      .withIndex("by_group", (q) => q.eq("studyGroupId", args.groupId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.patch(membership._id, { isActive: false });
    }

    return true;
  },
});

export const generateInviteLink = mutation({
  args: { groupId: v.id("studyGroups") },
  handler: async (ctx, args) => {
    // Generate unique invite code
    const inviteCode =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Set expiration to 7 days from now
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    // Check if invite link already exists
    const existingInvite = await ctx.db
      .query("studyGroupInvites")
      .withIndex("by_group", (q) => q.eq("studyGroupId", args.groupId))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .first();

    if (existingInvite) {
      return existingInvite;
    }

    return await ctx.db.insert("studyGroupInvites", {
      studyGroupId: args.groupId,
      inviteCode,
      expiresAt,
      createdAt: Date.now(),
      usedCount: 0,
      maxUses: 50, // Limit to 50 uses
    });
  },
});

export const getInviteLink = query({
  args: { groupId: v.id("studyGroups") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studyGroupInvites")
      .withIndex("by_group", (q) => q.eq("studyGroupId", args.groupId))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .first();
  },
});

export const getGroupByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("studyGroupInvites")
      .withIndex("by_code", (q) => q.eq("inviteCode", args.inviteCode))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .first();

    if (!invite) return null;

    const group = await ctx.db.get(invite.studyGroupId);
    if (!group) return null;

    const course = await ctx.db.get(group.courseId);

    // Check if current user is already a member (you'd need to implement user context)
    // For now, we'll assume they're not a member

    return { ...group, course, isUserMember: false };
  },
});

export const joinGroupByInvite = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("studyGroupInvites")
      .withIndex("by_code", (q) => q.eq("inviteCode", args.inviteCode))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .first();

    if (!invite) throw new Error("Invalid or expired invite code");

    if (invite.usedCount >= invite.maxUses) {
      throw new Error("Invite link has reached maximum uses");
    }

    const group = await ctx.db.get(invite.studyGroupId);
    if (!group) throw new Error("Study group not found");

    if (group.currentMembers >= group.maxMembers) {
      throw new Error("Study group is full");
    }

    // For demo purposes, we'll use a mock user ID
    // In a real app, you'd get this from the user context
    const mockUserId = "user123" as Id<"users">;

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("studyGroupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("studyGroupId", invite.studyGroupId).eq("userId", mockUserId)
      )
      .first();

    if (existingMembership) {
      throw new Error("User already in this study group");
    }

    // Add user to group
    await ctx.db.insert("studyGroupMembers", {
      studyGroupId: invite.studyGroupId,
      userId: mockUserId,
      role: "member",
      joinedAt: Date.now(),
      contributions: 0,
      isActive: true,
    });

    // Update member count and invite usage
    await ctx.db.patch(invite.studyGroupId, {
      currentMembers: group.currentMembers + 1,
    });

    await ctx.db.patch(invite._id, {
      usedCount: invite.usedCount + 1,
    });

    return true;
  },
});
