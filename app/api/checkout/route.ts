import { NextResponse } from "next/server";

import { api as polarApi } from "@/lib/polar";
import { getAuthenticatedUser } from "@/lib/server/convex-auth";

export async function POST(request: Request) {
  try {
    const authentication = await getAuthenticatedUser();
    if (!authentication) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { user } = authentication;

    const body: unknown = await request.json();
    const productId =
      typeof body === "object" && body !== null && "productId" in body
        ? (body as { productId?: unknown }).productId
        : undefined;

    if (typeof productId !== "string" || productId.trim().length === 0) {
      return NextResponse.json({ error: "A valid product is required" }, { status: 400 });
    }

    const origin = process.env.POLAR_SUCCESS_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const baseUrl = origin.endsWith("/") ? origin.slice(0, -1) : origin;
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_ID}`;

    // Create a checkout session with Polar
    const checkout = await polarApi.checkouts.create({
      products: [productId],
      successUrl,
      customerEmail: user.email,
      metadata: {
        userId: user._id,
        productId,
      },
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
