import { api } from "@/lib/polar";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { productId, email, userId } = await request.json();

    const origin = process.env.POLAR_SUCCESS_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const baseUrl = origin.endsWith("/") ? origin.slice(0, -1) : origin;
    const successUrl = `${baseUrl}/checkout/success?session_id=${productId}&user_id=${userId || ""}`;

    // Create a checkout session with Polar
    const checkout = await api.checkouts.create({
      products: [productId],
      successUrl,
      customerEmail: email,
      metadata: {
        userId,
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
