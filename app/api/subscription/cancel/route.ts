import { polarClient } from "@/lib/polar-client";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, cancelAtPeriodEnd } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const result = await polarClient.cancelSubscription(
      subscriptionId,
      cancelAtPeriodEnd ?? true
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
