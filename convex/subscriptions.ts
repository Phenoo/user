import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { auth } from "./auth";

const subscriptionStatus = v.union(
  v.literal("active"),
  v.literal("canceled"),
  v.literal("incomplete"),
  v.literal("incomplete_expired"),
  v.literal("past_due"),
  v.literal("trialing"),
  v.literal("unpaid")
);

const invoiceStatus = v.union(
  v.literal("draft"),
  v.literal("open"),
  v.literal("paid"),
  v.literal("uncollectible"),
  v.literal("void")
);

function hasValidWebhookSecret(webhookSecret?: string) {
  return Boolean(
    process.env.POLAR_WEBHOOK_SECRET &&
      webhookSecret === process.env.POLAR_WEBHOOK_SECRET
  );
}

async function assertCurrentUser(ctx: any, userId: Id<"users">) {
  const currentUserId = await auth.getUserId(ctx);
  if (!currentUserId || currentUserId !== userId) {
    throw new ConvexError("Unauthorized access");
  }
}

function assertWebhook(webhookSecret: string) {
  if (!hasValidWebhookSecret(webhookSecret)) {
    throw new ConvexError("Unauthorized webhook request");
  }
}

async function createSubscriptionNotification(
  ctx: any,
  userId: Id<"users">,
  dedupKey: string,
  title: string,
  message: string
) {
  const existing = await ctx.db
    .query("notifications")
    .withIndex("by_user_dedup", (q: any) =>
      q.eq("userId", userId).eq("dedupKey", dedupKey)
    )
    .unique();
  if (existing) return;

  await ctx.db.insert("notifications", {
    userId,
    type: "subscription",
    title,
    message,
    actionUrl: "/dashboard/settings?section=billing",
    dedupKey,
    isRead: false,
    createdAt: Date.now(),
  });
}

function getSubscriptionNotice(status: string, productName: string) {
  const plan = productName || "Your subscription";
  switch (status) {
    case "active":
      return { title: "Subscription active", message: `${plan} is now active.` };
    case "trialing":
      return { title: "Trial started", message: `${plan} trial is now active.` };
    case "canceled":
      return { title: "Subscription canceled", message: `${plan} has been canceled.` };
    case "past_due":
    case "unpaid":
      return {
        title: "Payment needs attention",
        message: `Update your billing details to keep ${plan} active.`,
      };
    default:
      return null;
  }
}

// Get current user's subscription
export const getCurrentSubscription = query({
  args: {
    userId: v.id("users"),
    webhookSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!hasValidWebhookSecret(args.webhookSecret)) {
      await assertCurrentUser(ctx, args.userId);
    }

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
    await assertCurrentUser(ctx, args.userId);

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
    webhookSecret: v.string(),
    userId: v.id("users"),
    polarSubscriptionId: v.string(),
    polarCustomerId: v.string(),
    productId: v.string(),
    productName: v.string(),
    priceId: v.string(),
    status: subscriptionStatus,
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    canceledAt: v.optional(v.number()),
    trialStart: v.optional(v.number()),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    assertWebhook(args.webhookSecret);
    const { webhookSecret: _webhookSecret, ...subscriptionData } = args;

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_polar_subscription", (q) =>
        q.eq("polarSubscriptionId", args.polarSubscriptionId)
      )
      .first();

    if (existing) {
      const planChanged = existing.productId !== args.productId;
      const statusChanged = existing.status !== args.status;

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
        priceId: args.priceId,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        canceledAt: args.canceledAt,
        previousProductId: planChanged
          ? existing.productId
          : existing.previousProductId,
        lastPlanChangeAt: planChanged ? Date.now() : existing.lastPlanChangeAt,
      });

      if (statusChanged) {
        const notice = getSubscriptionNotice(args.status, args.productName);
        if (notice) {
          await createSubscriptionNotification(
            ctx,
            args.userId,
            `subscription:${args.polarSubscriptionId}:${args.status}:${args.currentPeriodEnd}`,
            notice.title,
            notice.message
          );
        }
      }
      return existing._id;
    } else {
      const subscriptionId = await ctx.db.insert("subscriptions", {
        ...subscriptionData,
        status: args.status,
      });
      const notice = getSubscriptionNotice(args.status, args.productName);
      if (notice) {
        await createSubscriptionNotification(
          ctx,
          args.userId,
          `subscription:${args.polarSubscriptionId}:${args.status}:${args.currentPeriodEnd}`,
          notice.title,
          notice.message
        );
      }
      return subscriptionId;
    }
  },
});

export const cancelSubscription = mutation({
  args: {
    userId: v.id("users"),
    polarSubscriptionId: v.string(),
    status: subscriptionStatus,
  },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_polar_subscription", (q) =>
        q.eq("polarSubscriptionId", args.polarSubscriptionId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing?._id, {
        status: args.status,
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
    await assertCurrentUser(ctx, args.userId);

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
    webhookSecret: v.string(),
    userId: v.id("users"),
    polarInvoiceId: v.string(),
    subscriptionId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: invoiceStatus,
    invoiceDate: v.number(),
    paidAt: v.optional(v.number()),
    invoiceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertWebhook(args.webhookSecret);
    const { webhookSecret: _webhookSecret, ...invoiceData } = args;

    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_polar_invoice", (q) =>
        q.eq("polarInvoiceId", args.polarInvoiceId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        paidAt: args.paidAt,
      });
      return existing._id;
    } else {
      const invoiceId = await ctx.db.insert("invoices", {
        ...invoiceData,
        subscriptionId: args.subscriptionId,
      });
      if (args.status === "paid") {
        await createSubscriptionNotification(
          ctx,
          args.userId,
          `invoice:${args.polarInvoiceId}:paid`,
          "Payment received",
          `Your ${args.currency.toUpperCase()} ${(args.amount / 100).toFixed(2)} payment was received.`
        );
      }
      return invoiceId;
    }
  },
});

export const getPlanChangeHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await assertCurrentUser(ctx, args.userId);

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
    webhookSecret: v.string(),
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
    assertWebhook(args.webhookSecret);
    const { webhookSecret: _webhookSecret, ...changeData } = args;
    return await ctx.db.insert("subscriptionChanges", changeData);
  },
});
