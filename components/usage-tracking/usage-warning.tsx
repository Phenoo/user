"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap, Crown } from "lucide-react";
import { useAuthToken } from "@convex-dev/auth/react";
import Link from "next/link";

interface UsageWarningProps {
  feature: string;
  className?: string;
}

export function UsageWarning({ feature, className = "" }: UsageWarningProps) {
  const token = useAuthToken();
  const user = useQuery(api.users.currentUser);
  const userId = user?._id;

  const usageData = useQuery(
    api.usageTracking.getAllUsage, 
    userId ? { userId } : "skip"
  );
  const limits = useQuery(api.featureLimits.getLimitsByPlan, {
    plan: user?.subscriptionPlan || "FREE",
  });

  if (!userId || !usageData || !limits) {
    return null;
  }

  const limit = limits.find((l) => l.feature === feature);
  const usage = usageData.find((u) => u.feature === feature);

  if (!limit) return null;

  const current = usage?.count || 0;
  const limitValue = limit.limit;
  const isUnlimited = limitValue === -1;
  const percentage = isUnlimited ? 0 : (current / limitValue) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  if (isUnlimited || (!isNearLimit && !isAtLimit)) {
    return null;
  }

  const getWarningMessage = () => {
    if (isAtLimit) {
      return {
        title: "Usage Limit Reached",
        description: `You've reached your limit of ${limitValue} ${feature.toLowerCase().replace(/_/g, " ")} for this month.`,
        icon: <AlertTriangle className="h-4 w-4" />,
        variant: "destructive" as const,
      };
    } else if (isNearLimit) {
      return {
        title: "Approaching Usage Limit",
        description: `You've used ${current} of ${limitValue} ${feature.toLowerCase().replace(/_/g, " ")}. Only ${limitValue - current} remaining.`,
        icon: <AlertTriangle className="h-4 w-4" />,
        variant: "default" as const,
      };
    }
    return null;
  };

  const warning = getWarningMessage();
  if (!warning) return null;

  const getUpgradeMessage = () => {
    const plan = user?.subscriptionPlan || "FREE";
    if (plan === "FREE") {
      return {
        title: "Upgrade to STUDENT",
        description: "Get 10x more usage and unlock advanced features",
        icon: <Zap className="h-4 w-4" />,
        href: "/dashboard/pricing",
      };
    } else if (plan === "STUDENT") {
      return {
        title: "Upgrade to STUDENTPRO",
        description: "Get unlimited usage and all premium features",
        icon: <Crown className="h-4 w-4" />,
        href: "/dashboard/pricing",
      };
    }
    return null;
  };

  const upgrade = getUpgradeMessage();

  return (
    <div className={`space-y-3 ${className}`}>
      <Alert variant={warning.variant}>
        {warning.icon}
        <AlertTitle>{warning.title}</AlertTitle>
        <AlertDescription>{warning.description}</AlertDescription>
      </Alert>

      {upgrade && (
        <Alert className="border-blue-200 bg-blue-50">
          {upgrade.icon}
          <AlertTitle className="text-blue-900">{upgrade.title}</AlertTitle>
          <AlertDescription className="text-blue-700">
            {upgrade.description}
          </AlertDescription>
          <div className="mt-3">
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Link href={upgrade.href}>Upgrade Now</Link>
            </Button>
          </div>
        </Alert>
      )}
    </div>
  );
}
