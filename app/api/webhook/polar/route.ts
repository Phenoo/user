// api/webhook/polar/route.ts
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Webhooks } from "@polar-sh/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onSubscriptionActive: async (payload) => {},
  onSubscriptionRevoked: async (payload) => {
    console.log(payload);
    try {
      await convex.mutation(api.users.updateUserSubscription, {
        userId: payload.data.metadata.userId as Id<"users">,
        status: "canceled",
      });
    } catch {}
  },
  onSubscriptionCanceled: async (payload) => {
    try {
      await convex.mutation(api.users.updateUserSubscription, {
        userId: payload.data.metadata.userId as Id<"users">,
        status: "canceled",
      });
    } catch {}
  },
  onSubscriptionCreated: async (payload) => {
    console.log(payload.data.prices, payload.data);
    try {
      await convex.mutation(api.users.updateUserSubscription, {
        userId: payload.data.metadata.userId as Id<"users">,
        status: "active",
        subscriptionId: payload.data.id,
        stripeCustomerId: payload.data.customerId,
        endsOn: payload.data.currentPeriodEnd?.toISOString(),
        tier: payload.data.product.name,
      });
      await convex.mutation(api.subscriptions.upsertSubscription, {
        userId: payload.data.metadata.userId as Id<"users">,
        polarSubscriptionId: payload.data.id,
        polarCustomerId: payload.data.customerId,
        productId: payload.data.productId,
        productName: payload.data.product.name,
        status: payload.data.status,
        currentPeriodStart: new Date(payload.data.currentPeriodStart).getTime(),
        //@ts-ignore
        currentPeriodEnd: payload.data.currentPeriodEnd
          ? new Date(payload.data.currentPeriodEnd).getTime()
          : undefined,
        cancelAtPeriodEnd: payload.data.cancelAtPeriodEnd,
        canceledAt: payload.data.canceledAt
          ? new Date(payload.data.canceledAt).getTime()
          : undefined,
        trialStart: payload.data.trialStart
          ? new Date(payload.data.trialStart).getTime()
          : undefined,
        trialEnd: payload.data.trialEnd
          ? new Date(payload.data.trialEnd).getTime()
          : undefined,
      });
    } catch {}
    console.log("onSubscriptionCreated");
  },
  onSubscriptionUpdated: async (payload) => {
    try {
      await convex.mutation(api.users.updateUserSubscription, {
        userId: payload.data.metadata.userId as Id<"users">,
        status: "active",
        subscriptionId: payload.data.id,
        stripeCustomerId: payload.data.customerId,
        endsOn: payload.data.currentPeriodEnd?.toISOString(),
        tier: payload.data.product.name,
      });
      await convex.mutation(api.subscriptions.upsertSubscription, {
        userId: payload.data.metadata.userId as Id<"users">,
        polarSubscriptionId: payload.data.id,
        polarCustomerId: payload.data.customerId,
        productId: payload.data.productId,
        productName: payload.data.product.name,
        status: payload.data.status,
        currentPeriodStart: new Date(payload.data.currentPeriodStart).getTime(),
        //@ts-ignore
        currentPeriodEnd: payload.data.currentPeriodEnd
          ? new Date(payload.data.currentPeriodEnd).getTime()
          : undefined,
        cancelAtPeriodEnd: payload.data.cancelAtPeriodEnd,
        canceledAt: payload.data.canceledAt
          ? new Date(payload.data.canceledAt).getTime()
          : undefined,
        trialStart: payload.data.trialStart
          ? new Date(payload.data.trialStart).getTime()
          : undefined,
        trialEnd: payload.data.trialEnd
          ? new Date(payload.data.trialEnd).getTime()
          : undefined,
      });
    } catch {}
    console.log("onSubscriptionCreated");
  },
  onOrderCreated: async (payload) => {
    const isProration = payload.data.billingReason === "subscription_update";

    await convex.mutation(api.subscriptions.recordInvoice, {
      userId: payload.data.metadata.userId as Id<"users">,
      polarInvoiceId: payload.data.id, // Use order ID as invoice ID
      subscriptionId: payload.data.subscriptionId ?? "",
      amount: payload.data.subtotalAmount,
      currency: payload.data.currency || "USD",
      status: "paid", // Orders are created after payment
      invoiceDate: new Date(payload.data.createdAt).getTime(),
      paidAt: new Date(payload.data.createdAt).getTime(),
      invoiceUrl: payload.data.customerId,
    });

    if (isProration && payload.data.subscription?.id) {
      const subscription = await convex.query(
        api.subscriptions.getCurrentSubscription,
        {
          userId: payload.data.metadata.userId as Id<"users">,
        }
      );

      if (subscription) {
        await convex.mutation(api.subscriptions.recordPlanChange, {
          userId: payload.data.metadata.userId as Id<"users">,
          subscriptionId: subscription._id,
          changeType: payload.data.subtotalAmount > 0 ? "upgrade" : "downgrade",
          effectiveDate: new Date(payload.data.createdAt).getTime(),
          prorationAmount: payload.data.subtotalAmount,
        });
      }
    }
  },
});

export async function GET() {
  return NextResponse.json({
    status: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
