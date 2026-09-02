import { ConvexError, v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { auth } from "./auth";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

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
    birthDate: v.optional(v.string()),
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

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getUserByStripeCustomerId = query({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .first();
  },
});

export const updateUserSubscription = mutation({
  args: {
    webhookSecret: v.string(),
    userId: v.id("users"),
    subscriptionId: v.optional(v.string()),
    tier: v.optional(v.string()),
    status: v.optional(v.string()),
    endsOn: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    plan: v.optional(
      v.union(v.literal("FREE"), v.literal("STUDENT"), v.literal("STUDENTPRO"))
    ),
  },
  handler: async (ctx, args) => {
    if (
      !process.env.POLAR_WEBHOOK_SECRET ||
      args.webhookSecret !== process.env.POLAR_WEBHOOK_SECRET
    ) {
      throw new ConvexError("Unauthorized webhook request");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    let calculatedPlan: "FREE" | "STUDENT" | "STUDENTPRO" = "FREE";

    if (args.plan) {
      calculatedPlan = args.plan;
    } else if (args.status === "active" || args.status === "trialing") {
      const tierLower = (args.tier || "").toLowerCase();
      if (tierLower.includes("pro") || tierLower.includes("scholar") || tierLower.includes("studentpro")) {
        calculatedPlan = "STUDENTPRO";
      } else {
        calculatedPlan = "STUDENT";
      }
    } else {
      calculatedPlan = "FREE";
    }

    await ctx.db.patch(args.userId, {
      subscriptionPlan: calculatedPlan,
      subscriptionTier: args.tier || (calculatedPlan === "FREE" ? "Free" : calculatedPlan === "STUDENTPRO" ? "Pro" : "Starter"),
      endsOn: args.endsOn,
      subscriptionId: args.subscriptionId,
      subscriptionStatus: args.status,
      stripeCustomerId: args.stripeCustomerId,
    });

    return { success: true, plan: calculatedPlan };
  },
});

//update subscription
export const updateSubscription = internalMutation({
  args: {
    subscriptionId: v.string(),
    userId: v.id("users"),
    endsOn: v.string(),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("canceled"),
        v.literal("incomplete"),
        v.literal("incomplete_expired"),
        v.literal("past_due"),
        v.literal("trialing"),
        v.literal("unpaid")
      )
    ),
    subscriptionPlan: v.optional(
      v.union(v.literal("FREE"), v.literal("STUDENT"), v.literal("STUDENTPRO"))
    ),
  },
  handler: async (
    ctx,
    { subscriptionId, userId, endsOn, subscriptionPlan, subscriptionStatus }
  ) => {
    await ctx.db.patch(userId, {
      subscriptionId: subscriptionId,
      endsOn: endsOn,
      subscriptionPlan: subscriptionPlan,
      subscriptionStatus: subscriptionStatus,
    });
  },
});

export const getCurrentUserOrThrow = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("email", (q: any) => q.eq("email", identity.email))
    .unique();

  if (!user) {
    throw new ConvexError("User not found");
  }

  return user;
};

export const getUserProfile = action({
  args: {},
  handler: async (ctx) => {
    // 1. Get the user's identity.
    const identity = await ctx.auth.getUserIdentity();

    // 2. Check if the user is authenticated.
    if (!identity) {
      throw new Error("Unauthenticated. Please log in.");
    }

    // 3. GET THE ACCESS TOKEN!
    // The token is available on the identity object. For Google, it's 'accessToken'.
    const accessToken = identity.accessToken;

    if (!accessToken) {
      throw new Error(
        "Access token not found. The user may not have granted the required scopes."
      );
    }

    // 4. Use the access token to call a Google API.
    // We'll call the userinfo endpoint as an example.
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          // The standard way to use an OAuth2 token.
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to fetch user profile from Google: ${response.status} ${errorBody}`
      );
    }

    const profileData = await response.json();

    // 5. Return the data to the client.
    // IMPORTANT: We are returning the profile data, NOT the access token itself.
    return profileData;
  },
});

export const cleanupOrphanedAuthAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("authAccounts").collect();
    let cleanedAccounts = 0;
    for (const account of accounts) {
      const user = await ctx.db.get(account.userId);
      if (!user) {
        await ctx.db.delete(account._id);
        cleanedAccounts++;
      }
    }

    const sessions = await ctx.db.query("authSessions").collect();
    let cleanedSessions = 0;
    for (const session of sessions) {
      const user = await ctx.db.get(session.userId);
      if (!user) {
        await ctx.db.delete(session._id);
        cleanedSessions++;
      }
    }

    return { cleanedAccounts, cleanedSessions };
  },
});
