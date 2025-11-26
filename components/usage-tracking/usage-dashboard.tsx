"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Layers,
  FileText,
  Brain,
  Download,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react";
import { useAuthToken } from "@convex-dev/auth/react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

interface UsageDashboardProps {
  userId: Id<"users">;
}

export function UsageDashboard({ userId }: UsageDashboardProps) {
  const user = useQuery(api.users.currentUser);
  const usageData = useQuery(api.usageTracking.getAllUsage, { userId });
  const limits = useQuery(api.featureLimits.getLimitsByPlan, {
    plan: user?.subscriptionPlan || "FREE",
  });

  if (!user || !usageData || !limits) {
    return <div>Loading usage data...</div>;
  }

  const plan = user.subscriptionPlan || "FREE";
  const isFreeTier = plan === "FREE";
  const isStudentTier = plan === "STUDENT";
  const isProTier = plan === "STUDENTPRO";

  const getUsageInfo = (feature: string) => {
    const limit = limits.find((l) => l.feature === feature);
    const usage = usageData.find((u) => u.feature === feature);

    if (!limit) return null;

    const current = usage?.count || 0;
    const limitValue = limit.limit;
    const isUnlimited = limitValue === -1;
    const percentage = isUnlimited ? 0 : (current / limitValue) * 100;
    const remaining = isUnlimited ? -1 : Math.max(0, limitValue - current);

    return {
      current,
      limit: limitValue,
      remaining,
      percentage: Math.min(100, percentage),
      isUnlimited,
      isNearLimit: percentage >= 80,
      isAtLimit: percentage >= 100,
    };
  };

  const features = [
    {
      key: "COURSES_CREATED",
      name: "Courses Created",
      icon: BookOpen,
      description: "Number of courses you can create",
    },
    {
      key: "DECKS_CREATED",
      name: "Flashcard Decks",
      icon: Layers,
      description: "Number of flashcard decks you can create",
    },
    {
      key: "CARDS_CREATED",
      name: "Flashcards",
      icon: FileText,
      description: "Total flashcards across all decks",
    },
    {
      key: "AI_GENERATIONS",
      name: "AI Generations",
      icon: Brain,
      description: "AI-powered content generations",
    },
    {
      key: "DATA_EXPORTS",
      name: "Data Exports",
      icon: Download,
      description: "Number of data exports per month",
    },
    {
      key: "ANALYTICS_VIEWS",
      name: "Analytics Views",
      icon: BarChart3,
      description: "Advanced analytics access",
    },
  ];

  const getStatusIcon = (usageInfo: any) => {
    if (usageInfo.isAtLimit)
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (usageInfo.isNearLimit)
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    if (usageInfo.isUnlimited)
      return <Zap className="w-4 h-4 text-green-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusColor = (usageInfo: any) => {
    if (usageInfo.isAtLimit) return "bg-red-500";
    if (usageInfo.isNearLimit) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Plan Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Usage Dashboard
              </CardTitle>
              <CardDescription>
                Track your feature usage and limits
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  isProTier
                    ? "default"
                    : isStudentTier
                      ? "secondary"
                      : "outline"
                }
                className={
                  isProTier
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : ""
                }
              >
                {plan} Plan
              </Badge>
              {isFreeTier && (
                <Link href="/dashboard/pricing">
                  <Button size="sm" variant="outline">
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const usageInfo = getUsageInfo(feature.key);
          if (!usageInfo) return null;

          const Icon = feature.icon;

          return (
            <Card key={feature.key} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <CardTitle className="text-sm">{feature.name}</CardTitle>
                  </div>
                  {getStatusIcon(usageInfo)}
                </div>
                <CardDescription className="text-xs">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used</span>
                    <span className="font-medium">
                      {usageInfo.isUnlimited ? "∞" : usageInfo.current} /{" "}
                      {usageInfo.isUnlimited ? "∞" : usageInfo.limit}
                    </span>
                  </div>
                  {!usageInfo.isUnlimited && (
                    <Progress value={usageInfo.percentage} className="h-2" />
                  )}
                  {!usageInfo.isUnlimited && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Remaining: {usageInfo.remaining}</span>
                      <span>{Math.round(usageInfo.percentage)}% used</span>
                    </div>
                  )}
                </div>

                {usageInfo.isAtLimit && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-600 font-medium">
                      Limit reached! Upgrade to continue.
                    </p>
                  </div>
                )}

                {usageInfo.isNearLimit && !usageInfo.isAtLimit && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-600 font-medium">
                      Approaching limit ({usageInfo.remaining} remaining)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>
            Compare features across different plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Feature</th>
                  <th className="text-center p-2">FREE</th>
                  <th className="text-center p-2">STUDENT</th>
                  <th className="text-center p-2">STUDENTPRO</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => {
                  const freeLimit =
                    limits.find(
                      (l) => l.plan === "FREE" && l.feature === feature.key
                    )?.limit || 0;
                  const studentLimit =
                    limits.find(
                      (l) => l.plan === "STUDENT" && l.feature === feature.key
                    )?.limit || 0;
                  const proLimit =
                    limits.find(
                      (l) =>
                        l.plan === "STUDENTPRO" && l.feature === feature.key
                    )?.limit || 0;

                  return (
                    <tr key={feature.key} className="border-b">
                      <td className="p-2 font-medium">{feature.name}</td>
                      <td className="text-center p-2">
                        <Badge
                          variant={plan === "FREE" ? "default" : "outline"}
                        >
                          {freeLimit === -1 ? "∞" : freeLimit}
                        </Badge>
                      </td>
                      <td className="text-center p-2">
                        <Badge
                          variant={plan === "STUDENT" ? "default" : "outline"}
                        >
                          {studentLimit === -1 ? "∞" : studentLimit}
                        </Badge>
                      </td>
                      <td className="text-center p-2">
                        <Badge
                          variant={
                            plan === "STUDENTPRO" ? "default" : "outline"
                          }
                        >
                          {proLimit === -1 ? "∞" : proLimit}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA for Free Users */}
      {isFreeTier && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">
              Ready to unlock more?
            </CardTitle>
            <CardDescription className="text-blue-700">
              Upgrade to STUDENT or STUDENTPRO for unlimited access to all
              features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/pricing">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                View Pricing Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
