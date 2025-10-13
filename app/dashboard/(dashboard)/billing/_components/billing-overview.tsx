"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, CreditCard, TrendingUp } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Subscription {
  _id: string;
  polarSubscriptionId: string;
  productName: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  canceledAt?: number;
}

interface BillingOverviewProps {
  subscription: Subscription | null;
  totalSpent: number;
  nextBillingDate?: number;
}

export function BillingOverview({
  subscription,
  totalSpent,
  nextBillingDate,
}: BillingOverviewProps) {
  const router = useRouter();
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const user = useQuery(api.users.currentUser);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setCanceling(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subscription.polarSubscriptionId,
          cancelAtPeriodEnd: true,
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Cancel error:", error);
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    setReactivating(true);
    try {
      const response = await fetch("/api/subscription/reactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subscription.polarSubscriptionId,
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Reactivate error:", error);
    } finally {
      setReactivating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            {subscription && (
              <Badge
                variant={
                  subscription.status === "active"
                    ? "green"
                    : subscription.status === "trialing"
                      ? "secondary"
                      : "destructive"
                }
              >
                {user?.subscriptionStatus}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div>
                <h3 className="text-2xl font-bold">
                  {subscription.productName}
                </h3>
                {subscription.cancelAtPeriodEnd && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-amber-600 dark:text-amber-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Cancels on{" "}
                      {format(
                        new Date(subscription.currentPeriodEnd),
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Billing period:{" "}
                  {format(new Date(subscription.currentPeriodStart), "MMM d")} -{" "}
                  {format(
                    new Date(subscription.currentPeriodEnd),
                    "MMM d, yyyy"
                  )}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                {subscription.cancelAtPeriodEnd ? (
                  <Button
                    onClick={handleReactivateSubscription}
                    disabled={reactivating}
                  >
                    {reactivating
                      ? "Reactivating..."
                      : "Reactivate Subscription"}
                  </Button>
                ) : (
                  user?.subscriptionStatus === "active" && (
                    <Button
                      onClick={handleCancelSubscription}
                      variant="destructive"
                      disabled={canceling}
                    >
                      {canceling ? "Canceling..." : "Cancel Subscription"}
                    </Button>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No active subscription
              </p>
              <Link href="/dashboard/pricing">
                <Button>Browse Plans</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalSpent / 100)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime billing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Billing Date
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextBillingDate
                ? format(new Date(nextBillingDate), "MMM d, yyyy")
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Automatic renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Billing Questions</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Have questions about your bill or need to update your payment
                information?
              </p>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Plan Changes</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Want to upgrade, downgrade, or learn more about our plans?
              </p>
              <Link href="/dashboard/pricing">
                <Button variant="outline" size="sm">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
