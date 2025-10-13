"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface SubscriptionCardProps {
  subscription: {
    productName: string;
    status: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
    canceledAt?: number;
  };
  onManage: () => void;
}

export function SubscriptionCard({
  subscription,
  onManage,
}: SubscriptionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "trialing":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "canceled":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "past_due":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">
              {subscription.productName}
            </CardTitle>
            <CardDescription className="mt-2">
              Your current subscription plan
            </CardDescription>
          </div>
          <Badge
            className={getStatusColor(subscription.status)}
            variant="secondary"
          >
            {subscription.status.charAt(0).toUpperCase() +
              subscription.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Current Period</p>
              <p className="text-sm text-muted-foreground">
                {format(
                  new Date(subscription.currentPeriodStart),
                  "MMM d, yyyy"
                )}{" "}
                -{" "}
                {format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Next Billing Date</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Subscription Ending
              </p>
              <p className="text-sm text-destructive/80">
                Your subscription will end on{" "}
                {format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        )}

        <Button onClick={onManage} className="w-full" size="lg">
          Manage Subscription
        </Button>
      </CardContent>
    </Card>
  );
}
