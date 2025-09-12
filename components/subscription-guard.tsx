"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import Link from "next/link";
import type { Id } from "../convex/_generated/dataModel";

interface SubscriptionGuardProps {
  userId: Id<"users">;
  requiredPlan: "STUDENT" | "PRO";
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function SubscriptionGuard({
  userId,
  requiredPlan,
  feature,
  children,
  fallback,
}: SubscriptionGuardProps) {
  const { subscription, isLoading } = useSubscription(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscription) {
    return fallback || <div>Unable to load subscription status</div>;
  }

  const hasAccess = () => {
    if (subscription.plan === "PRO") return true;
    if (requiredPlan === "STUDENT" && subscription.plan === "STUDENT")
      return true;
    return false;
  };

  const isActive = subscription.isActive || subscription.plan === "FREE";

  if (hasAccess() && isActive) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Premium Feature
        </CardTitle>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {feature} is available with the {requiredPlan} plan or higher.
        </p>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Current plan:{" "}
            <span className="font-medium">{subscription.plan}</span>
          </p>

          {!isActive && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Your subscription is {subscription.status}. Please update your
              payment method.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/dashboard/pricing">
            <Button className="w-full">Upgrade to {requiredPlan}</Button>
          </Link>

          {subscription.stripeCustomerId && !isActive && (
            <Button variant="outline" className="w-full bg-transparent">
              Update Payment Method
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
