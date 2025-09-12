"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BillingPortalButtonProps {
  customerId: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
}

export function BillingPortalButton({
  customerId,
  children,
  variant = "outline",
  size = "default",
}: BillingPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePortalAccess = async () => {
    if (!customerId) {
      toast.error("No billing information found");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to Stripe billing portal
      window.location.href = url;
    } catch (error) {
      console.error("Portal error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to access billing portal"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePortalAccess}
      disabled={isLoading}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Settings className="mr-2 h-4 w-4" />
          {children || "Manage Billing"}
        </>
      )}
    </Button>
  );
}
