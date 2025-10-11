// api/webhook/polar/route.ts
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Webhooks } from "@polar-sh/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onPayload: async (payload) => {},
  onSubscriptionActive: async (payload) => {
    console.log("onSubscriptionActive");
  },
  onSubscriptionCanceled: async (payload) => {
    try {
      await convex.mutation(api.users.updateUserSubscription, {
        userId: payload.data.metadata.userId as Id<"users">,
        status: "inactive",
      });
    } catch {}
  },
  onSubscriptionCreated: async (payload) => {
    try {
      await convex.mutation(api.users.updateUserSubscription, {
        userId: payload.data.metadata.userId as Id<"users">,
        status: "active",
        stripeCustomerId: payload.data.customerId,
        tier: payload.data.productId,
      });
    } catch {}
    console.log("onSubscriptionCreated");
  },
});

export async function GET() {
  console.log("shshshhs");
  return NextResponse.json({
    status: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
