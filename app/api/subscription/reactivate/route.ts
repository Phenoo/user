import { type NextRequest, NextResponse } from "next/server";
import { polarClient } from "@/lib/polar-client";

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const result = await polarClient.reactivateSubscription(subscriptionId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Reactivate subscription error:", error);
    return NextResponse.json(
      { error: "Failed to reactivate subscription" },
      { status: 500 }
    );
  }
}
