"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { stripePromise } from "@/lib/stripe-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CheckoutButtonProps {
  priceId: string;
  userId: string;
  plan: string;
  billingCycle?: "monthly" | "yearly";
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function CheckoutButton({
  priceId,
  userId,
  plan,
  billingCycle = "monthly",
  children,
  variant = "default",
  size = "default",
  className,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!priceId) {
      toast.error("Invalid pricing plan selected");
      return;
    }

    setIsLoading(true);

    try {
      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId,
          plan,
          billingCycle,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
