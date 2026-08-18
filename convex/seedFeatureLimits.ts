import { mutation } from "./_generated/server";

// Seed initial feature limits for all subscription plans
export const seedFeatureLimits = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const featureLimits = [
      // FREE Plan Limits
      { plan: "FREE", feature: "COURSES_CREATED", limit: 1 },
      { plan: "FREE", feature: "DECKS_CREATED", limit: 2 },
      { plan: "FREE", feature: "CARDS_CREATED", limit: 20 },
      { plan: "FREE", feature: "AI_GENERATIONS", limit: 3 },
      { plan: "FREE", feature: "DATA_EXPORTS", limit: 0 },
      { plan: "FREE", feature: "ANALYTICS_VIEWS", limit: 2 },

      // STUDENT Plan Limits
      { plan: "STUDENT", feature: "COURSES_CREATED", limit: 5 },
      { plan: "STUDENT", feature: "DECKS_CREATED", limit: 10 },
      { plan: "STUDENT", feature: "CARDS_CREATED", limit: 100 },
      { plan: "STUDENT", feature: "AI_GENERATIONS", limit: 25 },
      { plan: "STUDENT", feature: "DATA_EXPORTS", limit: 3 },
      { plan: "STUDENT", feature: "ANALYTICS_VIEWS", limit: 25 },

      // STUDENTPRO Plan Limits (Unlimited)
      { plan: "STUDENTPRO", feature: "COURSES_CREATED", limit: -1 },
      { plan: "STUDENTPRO", feature: "DECKS_CREATED", limit: -1 },
      { plan: "STUDENTPRO", feature: "CARDS_CREATED", limit: -1 },
      { plan: "STUDENTPRO", feature: "AI_GENERATIONS", limit: -1 },
      { plan: "STUDENTPRO", feature: "DATA_EXPORTS", limit: -1 },
      { plan: "STUDENTPRO", feature: "ANALYTICS_VIEWS", limit: -1 },
    ] as const;

    for (const limit of featureLimits) {
      await ctx.db.insert("featureLimits", {
        plan: limit.plan,
        feature: limit.feature,
        limit: limit.limit,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { seeded: featureLimits.length };
  },
});
