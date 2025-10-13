"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";

interface SubscriptionStatsProps {
  subscription: {
    currentPeriodStart: number;
    currentPeriodEnd: number;
  };
  totalSpent?: number;
}

export function SubscriptionStats({
  subscription,
  totalSpent = 0,
}: SubscriptionStatsProps) {
  const daysRemaining = Math.ceil(
    (subscription.currentPeriodEnd - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const daysInPeriod = Math.ceil(
    (subscription.currentPeriodEnd - subscription.currentPeriodStart) /
      (1000 * 60 * 60 * 24)
  );

  const stats = [
    {
      label: "Days Remaining",
      value: daysRemaining.toString(),
      icon: Calendar,
      description: `${daysInPeriod} days total`,
    },
    {
      label: "Total Spent",
      value: `$${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      description: "All time",
    },
    {
      label: "Usage",
      value: `${Math.round(((daysInPeriod - daysRemaining) / daysInPeriod) * 100)}%`,
      icon: TrendingUp,
      description: "Current period",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              <stat.icon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
