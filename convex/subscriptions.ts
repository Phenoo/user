import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Get user subscription status
export const getUserSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      plan: user.subscriptionPlan || "FREE",
      status: user.subscriptionStatus,
      cancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd,
      stripeCustomerId: user.stripeCustomerId,
    };
  },
});

// Update user subscription from Stripe webhook

// Create or update Stripe customer ID
const updateStripeCustomerId = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stripeCustomerId: args.stripeCustomerId,
      updatedAt: Date.now(),
    });
  },
});

// Log subscription events for webhook processing
export const logSubscriptionEvent = mutation({
  args: {
    userId: v.id("users"),
    stripeEventId: v.string(),
    eventType: v.string(),
    subscriptionId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    // Check if event already processed
    const existingEvent = await ctx.db
      .query("subscriptionEvents")
      .withIndex("by_stripe_event", (q) =>
        q.eq("stripeEventId", args.stripeEventId)
      )
      .first();

    if (existingEvent) {
      return { processed: true, eventId: existingEvent._id };
    }

    const eventId = await ctx.db.insert("subscriptionEvents", {
      userId: args.userId,
      stripeEventId: args.stripeEventId,
      eventType: args.eventType,
      subscriptionId: args.subscriptionId,
      customerId: args.customerId,
      processed: false,
      data: args.data,
      createdAt: Date.now(),
    });

    return { processed: false, eventId };
  },
});

// Check subscription limits
export const checkSubscriptionLimits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const plan = user.subscriptionPlan || "FREE";

    // Get current usage
    const flashcardDecks = await ctx.db
      .query("flashcardDecks")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .collect();

    const studyGroupMemberships = await ctx.db
      .query("studyGroupMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Define limits based on plan
    const limits = {
      FREE: { flashcardDecks: 5, studyGroups: 2, cardsPerDeck: 50 },
      STUDENT: { flashcardDecks: -1, studyGroups: -1, cardsPerDeck: -1 },
      PRO: { flashcardDecks: -1, studyGroups: -1, cardsPerDeck: -1 },
      STUDENTPRO: { flashcardDecks: -1, studyGroups: -1, cardsPerDeck: -1 },
      STUDENTPRO_YEAR: {
        flashcardDecks: -1,
        studyGroups: -1,
        cardsPerDeck: -1,
      },
      STUDENT_YEAR: { flashcardDecks: -1, studyGroups: -1, cardsPerDeck: -1 },
    };

    const planLimits = limits[plan];

    return {
      plan,
      usage: {
        flashcardDecks: flashcardDecks.length,
        studyGroups: studyGroupMemberships.length,
      },
      limits: planLimits,
      canCreateDeck:
        planLimits.flashcardDecks === -1 ||
        flashcardDecks.length < planLimits.flashcardDecks,
      canJoinGroup:
        planLimits.studyGroups === -1 ||
        studyGroupMemberships.length < planLimits.studyGroups,
    };
  },
});
