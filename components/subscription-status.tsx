"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Crown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { BillingPortalButton } from "./billing-portal-button";
import Link from "next/link";
import type { Id } from "../convex/_generated/dataModel";

interface SubscriptionStatusProps {
  userId: Id<"users">;
  showDetails?: boolean;
}

export function SubscriptionStatus({
  userId,
  showDetails = true,
}: SubscriptionStatusProps) {
  const { subscription, isLoading, planConfig } = useSubscription(userId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const getStatusIcon = () => {
    if (subscription.isActive)
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (subscription.isPastDue)
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (subscription.isCanceled)
      return <XCircle className="h-5 w-5 text-red-500" />;
    return <Clock className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (subscription.plan === "FREE") return "Free Plan";
    if (subscription.isActive) return "Active";
    if (subscription.isPastDue) return "Payment Required";
    if (subscription.isCanceled) return "Canceled";
    return subscription.status || "Unknown";
  };

  const getStatusVariant = ():
    | "default"
    | "secondary"
    | "destructive"
    | "outline" => {
    if (subscription.plan === "FREE") return "secondary";
    if (subscription.isActive) return "default";
    if (subscription.isPastDue) return "destructive";
    if (subscription.isCanceled) return "outline";
    return "secondary";
  };

  const getPlanIcon = () => {
    switch (subscription.plan) {
      case "PRO":
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case "STUDENT":
        return <Zap className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {getPlanIcon()}
          <span>{subscription.plan} Plan</span>
          <Badge variant={getStatusVariant()}>
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-4">
          {/* Subscription Details */}
          {subscription.plan !== "FREE" && (
            <div className="space-y-3">
              {subscription.currentPeriodEnd && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {subscription.cancelAtPeriodEnd ? "Expires" : "Renews"}:
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}

              {subscription.daysUntilExpiry !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Time remaining:
                    </span>
                    <span>{subscription.daysUntilExpiry} days</span>
                  </div>
                  <Progress
                    value={Math.max(
                      0,
                      Math.min(100, (subscription.daysUntilExpiry / 30) * 100)
                    )}
                    className="h-2"
                  />
                </div>
              )}

              {subscription.cancelAtPeriodEnd && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Your subscription will end on{" "}
                      {new Date(
                        subscription.currentPeriodEnd!
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Plan Features */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Plan Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {planConfig.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {feature}
                </li>
              ))}
              {planConfig.features.length > 3 && (
                <li className="text-xs">
                  +{planConfig.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {subscription.plan === "FREE" ? (
              <Link href="/pricing">
                <Button size="sm" className="w-full">
                  Upgrade Plan
                </Button>
              </Link>
            ) : (
              <>
                {subscription.stripeCustomerId && (
                  <BillingPortalButton
                    customerId={subscription.stripeCustomerId}
                    size="sm"
                  >
                    Manage Billing
                  </BillingPortalButton>
                )}
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                  >
                    Change Plan
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
