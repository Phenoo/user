import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get current user's subscription
export const getCurrentSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("status"), "canceled"))
      .first();

    return subscription;
  },
});

// Get all available products/plans
export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return products;
  },
});

// Get user's billing history
export const getInvoices = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    return invoices;
  },
});

// Create or update subscription from webhook
// export const upsertSubscription = mutation({
//   args: {
//     userId: v.id("users"),
//     polarSubscriptionId: v.string(),
//     polarCustomerId: v.string(),
//     productId: v.string(),
//     productName: v.string(),
//     status: v.string(),
//     currentPeriodStart: v.optional(v.number()),
//     currentPeriodEnd: v.optional(v.number()),
//     cancelAtPeriodEnd: v.boolean(),
//     canceledAt: v.optional(v.number()),
//     trialStart: v.optional(v.number()),
//     trialEnd: v.optional(v.number()),
//   },
//   handler: async (ctx, args) => {
//     const existing = await ctx.db
//       .query("subscriptions")
//       .withIndex("by_polar_subscription", (q) =>
//         q.eq("polarSubscriptionId", args.polarSubscriptionId)
//       )
//       .first();

//     if (existing) {
//       await ctx.db.patch(existing._id, {
//         status: args.status as any,
//         currentPeriodStart: args.currentPeriodStart,
//         currentPeriodEnd: args.currentPeriodEnd,
//         cancelAtPeriodEnd: args.cancelAtPeriodEnd,
//         canceledAt: args.canceledAt,
//       });
//       return existing._id;
//     } else {
//       return await ctx.db.insert("subscriptions", {
//         ...args,
//         status: args.status as any,
//       });
//     }
//   },
// });
export const upsertSubscription = mutation({
  args: {
    userId: v.id("users"),
    polarSubscriptionId: v.string(),
    polarCustomerId: v.string(),
    productId: v.string(),
    productName: v.string(),
    priceId: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    canceledAt: v.optional(v.number()),
    trialStart: v.optional(v.number()),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_polar_subscription", (q) =>
        q.eq("polarSubscriptionId", args.polarSubscriptionId)
      )
      .first();

    if (existing) {
      const planChanged = existing.productId !== args.productId;

      if (planChanged) {
        await ctx.db.insert("subscriptionChanges", {
          userId: args.userId,
          subscriptionId: existing._id,
          changeType: "plan_change",
          fromProductId: existing.productId,
          toProductId: args.productId,
          toPriceId: args.priceId,
          effectiveDate: Date.now(),
        });
      }

      await ctx.db.patch(existing._id, {
        productId: args.productId,
        productName: args.productName,
        status: args.status as any,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        canceledAt: args.canceledAt,
        previousProductId: planChanged
          ? existing.productId
          : existing.previousProductId,
        lastPlanChangeAt: planChanged ? Date.now() : existing.lastPlanChangeAt,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("subscriptions", {
        ...args,
        status: args.status as any,
      });
    }
  },
});

export const cancelSubscription = mutation({
  args: {
    userId: v.id("users"),
    polarSubscriptionId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_polar_subscription", (q) =>
        q.eq("polarSubscriptionId", args.polarSubscriptionId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing?._id, {
        status: args.status as any,
      });
    }

    return existing?._id;
  },
});
// Sync products from Polar
export const syncProduct = mutation({
  args: {
    polarProductId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    prices: v.array(
      v.object({
        id: v.string(),
        amount: v.number(),
        currency: v.string(),
        interval: v.union(v.literal("month"), v.literal("year")),
        intervalCount: v.number(),
      })
    ),
    features: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_polar_product", (q) =>
        q.eq("polarProductId", args.polarProductId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("products", args);
    }
  },
});

// Get subscription history with all status changes
export const getSubscriptionHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return subscriptions;
  },
});

// Record invoice from webhook
export const recordInvoice = mutation({
  args: {
    userId: v.id("users"),
    polarInvoiceId: v.string(),
    subscriptionId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    invoiceDate: v.number(),
    paidAt: v.optional(v.number()),
    invoiceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_polar_invoice", (q) =>
        q.eq("polarInvoiceId", args.polarInvoiceId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status as any,
        paidAt: args.paidAt,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("invoices", {
        ...args,
        status: args.status as any,
        subscriptionId: args.subscriptionId,
      });
    }
  },
});

export const getPlanChangeHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const changes = await ctx.db
      .query("subscriptionChanges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    return changes;
  },
});

export const recordPlanChange = mutation({
  args: {
    userId: v.id("users"),
    subscriptionId: v.id("subscriptions"),
    changeType: v.union(
      v.literal("upgrade"),
      v.literal("downgrade"),
      v.literal("plan_change"),
      v.literal("canceled"),
      v.literal("reactivated")
    ),
    fromProductId: v.optional(v.string()),
    toProductId: v.optional(v.string()),
    fromPriceId: v.optional(v.string()),
    toPriceId: v.optional(v.string()),
    effectiveDate: v.number(),
    prorationAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subscriptionChanges", args);
  },
});
