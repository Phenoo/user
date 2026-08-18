"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Brain,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Calendar,
  Award,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";

export default function AISuggestionsPage() {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null
  );

  const user = useQuery(api.users.currentUser);
  const userId = user?._id as Id<"users">;

  const suggestions = useQuery(
    api.aiSuggestions.getUserSuggestions,
    userId ? { userId } : "skip"
  );

  const analytics = useQuery(
    api.analytics.getAnalyticsSummary,
    userId ? { userId } : "skip"
  );

  if (user === undefined || suggestions === undefined || analytics === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-6 space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <Skeleton className="h-32 w-full" />
              </Card>
              <Card className="p-6 space-y-4">
                <Skeleton className="h-6 w-48" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="p-6 space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-24 w-full" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    streakDays = 0,
    studyTimeHours = 0,
    cardsMastered = 0,
    accuracyRate = 0,
  } = analytics || {};

  const weeklyGoal = 20; // Target study hours

  const getImpactColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "MEDIUM":
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "STUDY_SCHEDULE":
        return Calendar;
      case "WEAK_AREAS":
        return Target;
      case "STUDY_METHOD":
        return Clock;
      default:
        return Brain;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-6 py-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <br />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold text-balance">
                AI Study Suggestions
              </h1>
              <p className="text-sm text-muted-foreground">
                Personalized recommendations based on your real study activity
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-emerald-800 dark:text-emerald-200">
                      Your Real Progress
                    </CardTitle>
                  </div>
                  <Badge className="bg-emerald-600 text-white">
                    Live Data
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {streakDays}
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">
                      Day Streak
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {studyTimeHours}h
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">
                      Hours This Week
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {cardsMastered}
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">
                      Cards Mastered
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {accuracyRate}%
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">
                      Accuracy Score
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-emerald-700 dark:text-emerald-300">
                      Weekly Goal Progress
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {studyTimeHours}/{weeklyGoal} hours
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (studyTimeHours / weeklyGoal) * 100)}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>
                  AI insights derived from your real study metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions && suggestions.length > 0 ? (
                  suggestions.map((suggestion) => {
                    const Icon = getIcon(suggestion.type);
                    const isSelected = selectedSuggestion === suggestion._id;

                    return (
                      <div
                        key={suggestion._id}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                            : "border-border hover:border-emerald-200 dark:hover:border-emerald-800"
                        }`}
                        onClick={() =>
                          setSelectedSuggestion(
                            isSelected ? null : suggestion._id
                          )
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-emerald-100 dark:bg-emerald-900 rounded-full p-2 mt-1">
                              <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-pretty">
                                  {suggestion.title}
                                </h3>
                                <Badge
                                  className={getImpactColor(suggestion.priority)}
                                  variant="secondary"
                                >
                                  {suggestion.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground text-pretty mb-2">
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <ChevronRight
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                isSelected ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No suggestions available at the moment. Keep studying to get personalized insights!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Study Efficiency</span>
                  <Badge variant="secondary">
                    {accuracyRate >= 80 ? "High" : accuracyRate >= 50 ? "Moderate" : "Building"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mastery Count</span>
                  <span className="text-sm font-semibold">{cardsMastered} cards</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Accuracy Rate</span>
                  <span className="text-sm font-semibold">{accuracyRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Streak</span>
                  <span className="text-sm font-semibold">{streakDays} days</span>
                </div>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200 text-pretty">
                    Take a 5-minute break every 25 minutes to maintain focus
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200 text-pretty">
                    Review material within 24 hours for better retention
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-800 dark:text-purple-200 text-pretty">
                    Use active recall instead of passive reading
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
