"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  BarChart3,
  Clock,
  Target,
  Brain,
  BookOpen,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

export function AnalyticsContainer() {
  const user = useQuery(api.users.currentUser);

  const analytics = useQuery(
    api.analytics.getAnalyticsSummary,
    user?._id ? { userId: user._id as Id<"users"> } : "skip"
  );

  if (user === undefined || analytics === undefined) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-28" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const isPremium =
    user?.subscriptionPlan === "STUDENT" ||
    user?.subscriptionPlan === "STUDENTPRO";

  const {
    studyTimeHours = 0,
    studyTimeChange = 0,
    accuracyRate = 0,
    cardsMastered = 0,
    cardsMasteredThisWeek = 0,
    streakDays = 0,
    dailyPerformance = [],
    subjectPerformance = [],
  } = analytics || {};

  return (
    <div className="min-h-screen bg-background p-6 pb-28">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <Badge variant={isPremium ? "default" : "secondary"}>
                {isPremium ? "Premium Active" : "Premium Feature"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Advanced insights into your study patterns and academic performance
            </p>
          </div>
          {!isPremium && (
            <Link href="/dashboard/pricing">
              <Button variant="default" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Upgrade to Unlock
              </Button>
            </Link>
          )}
        </div>

        {/* Content Section with Blur for Non-Premium */}
        <div className="relative rounded-2xl overflow-hidden mb-12">
          <div
            className={
              !isPremium
                ? "filter blur-md select-none pointer-events-none opacity-40 transition-all"
                : ""
            }
          >
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Study Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studyTimeHours}h</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                  <div
                    className={`text-xs mt-1 ${
                      studyTimeChange >= 0 ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {studyTimeChange >= 0
                      ? `+${studyTimeChange}% from last week`
                      : `${studyTimeChange}% from last week`}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-green-500" />
                    Accuracy Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accuracyRate}%</div>
                  <p className="text-xs text-muted-foreground">Average accuracy</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {accuracyRate > 0 ? "Based on card practice" : "No study sessions yet"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Cards Mastered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cardsMastered}</div>
                  <p className="text-xs text-muted-foreground">Total mastered</p>
                  <div className="text-xs text-green-600 mt-1">
                    +{cardsMasteredThisWeek} this week
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                    Study Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{streakDays}</div>
                  <p className="text-xs text-muted-foreground">Days in a row</p>
                  <div className="text-xs text-green-600 mt-1">
                    {streakDays > 0 ? "Keep it up!" : "Start a session today!"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real Study Performance Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Study Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    {dailyPerformance.some((d) => d.hours > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyPerformance}>
                          <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            unit="h"
                            domain={[0, "auto"]}
                          />
                          <Tooltip
                            formatter={(val: number) => [`${val} hours`, "Study Duration"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="hours"
                            stroke="#3B82F6"
                            fillOpacity={1}
                            fill="url(#colorHours)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Clock className="h-10 w-10 mx-auto mb-2 opacity-40" />
                          <p className="font-medium">No study activity recorded yet this week</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Complete a Pomodoro timer session to see your trends here.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Real Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Subject Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subjectPerformance.length > 0 ? (
                    <div className="space-y-4">
                      {subjectPerformance.map((item) => (
                        <div key={item.courseId} className="space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span>
                              {item.subject} ({item.code})
                            </span>
                            <span>
                              {item.totalCards > 0
                                ? `${item.accuracy}% (${item.cardsMastered}/${item.totalCards} mastered)`
                                : "No flashcards yet"}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`${item.color} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${Math.max(item.accuracy, item.totalCards > 0 ? 5 : 0)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        <p className="font-medium">No courses added yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add courses and flashcard decks to track accuracy per subject.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Premium Lock Overlay for Non-Premium Users */}
          {!isPremium && (
            <div className="absolute inset-0 z-0 flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm rounded-xl">
              <Card className="max-w-md w-full p-6 text-center shadow-2xl border-primary/20 bg-card/95 backdrop-blur-sm">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Lock className="w-7 h-7" />
                </div>
              
                <h2 className="text-2xl font-bold mb-2">Unlock Advanced Analytics</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Upgrade to Student or StudentPro to access detailed study time trends, course performance breakdowns, and streak insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/dashboard/pricing">
                    <Button className="w-full sm:w-auto font-semibold gap-2">
                      Upgrade to Premium
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
