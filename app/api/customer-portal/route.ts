import { type NextRequest, NextResponse } from "next/server";
import { polarClient } from "@/lib/polar-client";

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const session = await polarClient.getCustomerPortalSession(customerId);

    return NextResponse.json(session);
  } catch (error) {
    console.error("Customer portal error:", error);
    return NextResponse.json(
      { error: "Failed to create customer portal session" },
      { status: 500 }
    );
  }
}
