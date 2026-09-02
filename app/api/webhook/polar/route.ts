// api/webhook/polar/route.ts
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Webhooks } from "@polar-sh/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid";

function normalizeSubscriptionStatus(
  status: unknown,
  isCancel: boolean
): SubscriptionStatus {
  if (isCancel) return "canceled";

  switch (status) {
    case "active":
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "trialing":
    case "unpaid":
      return status;
    default:
      return "incomplete";
  }
}

const processSubscriptionEvent = async (payload: any, isCancel = false) => {
  const userId = payload.data?.metadata?.userId as Id<"users">;
  if (!userId) {
    throw new Error("No userId found in metadata for Polar webhook event");
  }

  const productName = payload.data?.product?.name || "";
  const productNameLower = productName.toLowerCase();

  let plan: "FREE" | "STUDENT" | "STUDENTPRO" = "FREE";
  if (!isCancel && (payload.data?.status === "active" || payload.data?.status === "trialing")) {
    if (productNameLower.includes("pro") || productNameLower.includes("scholar") || productNameLower.includes("studentpro")) {
      plan = "STUDENTPRO";
    } else {
      plan = "STUDENT";
    }
  }

  const status = normalizeSubscriptionStatus(payload.data?.status, isCancel);

  await convex.mutation(api.users.updateUserSubscription, {
      webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
      userId,
      status,
      subscriptionId: payload.data?.id,
      stripeCustomerId: payload.data?.customerId,
      endsOn: payload.data?.currentPeriodEnd
        ? new Date(payload.data.currentPeriodEnd).toISOString()
        : undefined,
      tier: productName || (plan === "STUDENTPRO" ? "Pro" : plan === "STUDENT" ? "Starter" : "Free"),
      plan,
  });

  const priceId =
    payload.data?.priceId ||
    payload.data?.prices?.[0]?.id ||
    payload.data?.productId ||
    "default_price";

  const currentPeriodEnd = payload.data?.currentPeriodEnd
    ? new Date(payload.data.currentPeriodEnd).getTime()
    : Date.now() + 30 * 24 * 60 * 60 * 1000;

  await convex.mutation(api.subscriptions.upsertSubscription, {
        webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
        userId,
        polarSubscriptionId: payload.data.id,
        polarCustomerId: payload.data.customerId || "",
        productId: payload.data.productId || "",
        productName: payload.data.product?.name || "",
        priceId,
        status,
        currentPeriodStart: payload.data?.currentPeriodStart
          ? new Date(payload.data.currentPeriodStart).getTime()
          : Date.now(),
        currentPeriodEnd,
        cancelAtPeriodEnd: payload.data?.cancelAtPeriodEnd ?? false,
        canceledAt: payload.data?.canceledAt
          ? new Date(payload.data.canceledAt).getTime()
          : undefined,
        trialStart: payload.data?.trialStart
          ? new Date(payload.data.trialStart).getTime()
          : undefined,
        trialEnd: payload.data?.trialEnd
          ? new Date(payload.data.trialEnd).getTime()
          : undefined,
  });
};

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onSubscriptionActive: async (payload) => {
    await processSubscriptionEvent(payload);
  },
  onSubscriptionRevoked: async (payload) => {
    await processSubscriptionEvent(payload, true);
  },
  onSubscriptionCanceled: async (payload) => {
    await processSubscriptionEvent(payload, true);
  },
  onSubscriptionCreated: async (payload) => {
    await processSubscriptionEvent(payload);
  },
  onSubscriptionUpdated: async (payload) => {
    await processSubscriptionEvent(payload);
  },
  onOrderCreated: async (payload) => {
    const isProration = payload.data.billingReason === "subscription_update";

    await convex.mutation(api.subscriptions.recordInvoice, {
      webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
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
          webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
        }
      );

      if (subscription) {
        await convex.mutation(api.subscriptions.recordPlanChange, {
          webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
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
