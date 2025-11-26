"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { useAuthToken } from "@convex-dev/auth/react";

interface UsageIndicatorProps {
  feature: string;
  className?: string;
  showDetails?: boolean;
}

export function UsageIndicator({
  feature,
  className = "",
  showDetails = false,
}: UsageIndicatorProps) {
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
  const remaining = isUnlimited ? -1 : Math.max(0, limitValue - current);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getStatusColor = () => {
    if (isAtLimit) return "text-red-500";
    if (isNearLimit) return "text-yellow-500";
    if (isUnlimited) return "text-green-500";
    return "text-green-500";
  };

  const getStatusIcon = () => {
    if (isAtLimit) return <AlertTriangle className="w-3 h-3" />;
    if (isNearLimit) return <AlertTriangle className="w-3 h-3" />;
    if (isUnlimited) return <Zap className="w-3 h-3" />;
    return <CheckCircle className="w-3 h-3" />;
  };

  if (showDetails) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">
              {isUnlimited ? "∞" : current} / {isUnlimited ? "∞" : limitValue}
            </span>
          </div>
          <Badge
            variant={
              isAtLimit ? "destructive" : isNearLimit ? "secondary" : "default"
            }
            className={getStatusColor()}
          >
            {isAtLimit ? "At Limit" : isNearLimit ? "Near Limit" : "Good"}
          </Badge>
        </div>
        {!isUnlimited && <Progress value={percentage} className="h-2" />}
        {!isUnlimited && remaining > 0 && (
          <p className="text-xs text-muted-foreground">
            {remaining} remaining this month
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-sm ${getStatusColor()}`}>
        {isUnlimited ? "∞" : current}/{isUnlimited ? "∞" : limitValue}
      </span>
      {isAtLimit && (
        <Badge variant="destructive" className="text-xs">
          Limit Reached
        </Badge>
      )}
    </div>
  );
}
