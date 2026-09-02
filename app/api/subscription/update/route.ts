import { type NextRequest, NextResponse } from "next/server";
import { polarClient } from "@/lib/polar-client";
import { getAuthenticatedSubscription } from "@/lib/server/convex-auth";

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, priceId } = await request.json();

    if (!subscriptionId || !priceId) {
      return NextResponse.json(
        { error: "Subscription ID and Price ID are required" },
        { status: 400 }
      );
    }

    const authentication = await getAuthenticatedSubscription();
    if (!authentication) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (authentication.subscription?.polarSubscriptionId !== subscriptionId) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const result = await polarClient.updateSubscription(
      subscriptionId,
      priceId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update subscription error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
