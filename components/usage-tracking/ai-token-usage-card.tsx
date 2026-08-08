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
import {
  CalendarClock,
  Brain,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Cpu,
  History,
  Layers3,
  ShieldCheck,
} from "lucide-react";

interface AITokenUsageCardProps {
  userId: string;
}

export function AITokenUsageCard({ userId }: AITokenUsageCardProps) {
  const usageDashboard = useQuery((api as any).aiRequests.getUsageDashboard, {
    userId,
  });

  if (!usageDashboard) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 w-40 bg-muted rounded mb-2" />
          <div className="h-4 w-60 bg-muted rounded" />
        </CardHeader>
        <CardContent className="h-32 bg-muted/20 rounded-lg" />
      </Card>
    );
  }

  const {
    plan,
    totalRequests,
    creditsUsed,
    creditsRemaining,
    entitlements,
    resetAt,
    totalInputTokens,
    totalCachedInputTokens,
    totalOutputTokens,
    totalReasoningTokens,
    totalTokens,
    totalEstimatedCostUSD,
    featureBreakdown,
    modelBreakdown,
    recentRequests,
  } = usageDashboard;

  const monthlyCredits = entitlements.ai.monthlyCredits;
  const usagePercentage =
    monthlyCredits > 0 ? Math.min(100, (creditsUsed / monthlyCredits) * 100) : 0;
  const resetDate = new Date(resetAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="border border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">

            <div>
              <CardTitle className="text-base flex items-center gap-2">
                AI Usage & Credits
              </CardTitle>
              <CardDescription className="text-xs">
                Monthly AI credits, request ledger, and model-cost visibility
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {plan} plan
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  AI Credits
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-bold font-mono">
                    {creditsUsed}
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground">
                    / {monthlyCredits}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {creditsRemaining} remaining. Resets {resetDate}.
                </p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                {entitlements.ai.deepReasoning
                  ? "Deep reasoning enabled"
                  : "Standard AI mode"}
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{Math.round(usagePercentage)}% of monthly allowance used</span>
                <span>{totalRequests} successful requests</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="p-3.5 rounded-xl border bg-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Estimated Cost</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold font-mono">
                  ${totalEstimatedCostUSD.toFixed(4)}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Current monthly ledger total
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border bg-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Reset Date</span>
                <CalendarClock className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="mt-2">
                <span className="text-lg font-bold">{resetDate}</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Monthly AI allowance refresh
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl border bg-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Tokens</span>
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold font-mono">
                {totalTokens.toLocaleString()}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tokens consumed
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border bg-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Token Distribution</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ArrowUpRight className="w-3 h-3 text-blue-500" /> Input:
                </span>
                <span>{totalInputTokens.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Layers3 className="w-3 h-3 text-violet-500" /> Cached:
                </span>
                <span>{totalCachedInputTokens.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ArrowDownLeft className="w-3 h-3 text-emerald-500" /> Output:
                </span>
                <span>{totalOutputTokens.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Brain className="w-3 h-3 text-amber-500" /> Reasoning:
                </span>
                <span>{totalReasoningTokens.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border bg-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Request Volume</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold font-mono">{totalRequests}</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Successful AI operations this month
              </p>
            </div>
          </div>
        </div>

        {/* Feature Token Usage Breakdown */}
        {featureBreakdown.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Usage by Feature
              </h4>
              <div className="space-y-2.5">
                {featureBreakdown.map((item: any) => {
                  const percent =
                    totalTokens > 0 ? (item.totalTokens / totalTokens) * 100 : 0;
                  return (
                    <div key={item.feature} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium capitalize">
                          {item.feature.replace(/-/g, " ")} ({item.count})
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {item.creditsUsed} credits
                        </span>
                      </div>
                      <Progress value={percent} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Usage by Model
              </h4>
              <div className="space-y-2.5">
                {modelBreakdown.map((item: any) => {
                  const percent =
                    totalTokens > 0 ? (item.totalTokens / totalTokens) * 100 : 0;
                  return (
                    <div key={item.model} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{item.model}</span>
                        <span className="font-mono text-muted-foreground">
                          ${item.cost.toFixed(4)}
                        </span>
                      </div>
                      <Progress value={percent} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent Token Logs */}
        {recentRequests.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <History className="w-3.5 h-3.5" />
              <span>Recent Activity</span>
            </div>
            <div className="border rounded-xl divide-y text-xs">
              {recentRequests.slice(0, 5).map((log: any) => (
                <div
                  key={log._id}
                  className="p-2.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">
                      {log.feature}
                    </Badge>
                    <span className="text-muted-foreground text-[11px]">
                      {log.model}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span>{log.totalTokens.toLocaleString()} tokens</span>
                    <span className="text-muted-foreground">
                      ${log.estimatedCostUSD.toFixed(5)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
