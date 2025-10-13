import { api } from "@/lib/polar";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { productId, email, userId } = await request.json();

    // Create a checkout session with Polar
    const checkout = await api.checkouts.create({
      products: [productId],
      successUrl: `${process.env.POLAR_SUCCESS_URL}checkout/success?session_id=${productId}`,

      customerEmail: email,
      metadata: {
        userId,
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
