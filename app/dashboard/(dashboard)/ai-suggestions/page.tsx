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
  Zap,
  Calendar,
  Award,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// Mock AI suggestions data
const mockSuggestions = [
  {
    id: 1,
    title: "Optimize Study Schedule",
    description:
      "Based on your performance, studying Math between 2-4 PM shows 35% better retention",
    impact: "High",
    category: "Schedule",
    icon: Calendar,
    actionText: "Apply Schedule",
    details:
      "Your peak focus hours align with afternoon sessions. Consider blocking this time for challenging subjects.",
  },
  {
    id: 2,
    title: "Review Weak Topics",
    description:
      "Focus on Calculus derivatives - you've struggled with 3 recent practice problems",
    impact: "Critical",
    category: "Content",
    icon: Target,
    actionText: "Start Review",
    details:
      "Spend 20 minutes daily on derivative rules. Use spaced repetition for better retention.",
  },
  {
    id: 3,
    title: "Increase Study Frequency",
    description:
      "Short 25-minute sessions work better for you than 2-hour blocks",
    impact: "Medium",
    category: "Method",
    icon: Clock,
    actionText: "Try Pomodoro",
    details:
      "Your attention span data suggests breaking study time into focused sprints with breaks.",
  },
  {
    id: 4,
    title: "Leverage Visual Learning",
    description: "You retain 40% more when using diagrams and mind maps",
    impact: "High",
    category: "Style",
    icon: Brain,
    actionText: "Create Mind Map",
    details:
      "Visual learners benefit from concept mapping. Try tools like diagrams for complex topics.",
  },
];

const mockProgress = {
  studyStreak: 12,
  hoursThisWeek: 18,
  weeklyGoal: 25,
  completedTopics: 8,
  totalTopics: 15,
  averageScore: 78,
};

export default function AISuggestionsPage() {
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(
    null
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-6 py-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
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
                Personalized recommendations to boost your learning
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
                      Your Progress
                    </CardTitle>
                  </div>
                  <Badge className="bg-emerald-600 text-white">
                    +25% Potential Growth
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {mockProgress.studyStreak}
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">
                      Day Streak
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {mockProgress.hoursThisWeek}
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">
                      Hours This Week
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {mockProgress.completedTopics}/{mockProgress.totalTopics}
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">
                      Topics Mastered
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {mockProgress.averageScore}%
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">
                      Average Score
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-emerald-700 dark:text-emerald-300">
                      Weekly Goal Progress
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {mockProgress.hoursThisWeek}/{mockProgress.weeklyGoal}{" "}
                      hours
                    </span>
                  </div>
                  <Progress
                    value={
                      (mockProgress.hoursThisWeek / mockProgress.weeklyGoal) *
                      100
                    }
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
                  AI-powered insights based on your study patterns and
                  performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockSuggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  const isSelected = selectedSuggestion === suggestion.id;

                  return (
                    <div
                      key={suggestion.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                          : "border-border hover:border-emerald-200 dark:hover:border-emerald-800"
                      }`}
                      onClick={() =>
                        setSelectedSuggestion(isSelected ? null : suggestion.id)
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
                                className={getImpactColor(suggestion.impact)}
                                variant="secondary"
                              >
                                {suggestion.impact}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground text-pretty mb-2">
                              {suggestion.description}
                            </p>
                            {isSelected && (
                              <div className="mt-3 p-3 bg-muted rounded-md">
                                <p className="text-sm text-pretty">
                                  {suggestion.details}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            {suggestion.actionText}
                          </Button>
                          <ChevronRight
                            className={`h-4 w-4 text-muted-foreground transition-transform ${isSelected ? "rotate-90" : ""}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  <Badge variant="secondary">Improving</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Focus Score</span>
                  <span className="text-sm font-semibold">8.2/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Retention Rate</span>
                  <span className="text-sm font-semibold">85%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Best Study Time</span>
                  <span className="text-sm font-semibold">2-4 PM</span>
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

            {/* Action Center */}
            <Card>
              <CardHeader>
                <CardTitle>Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Generate Study Plan
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Schedule Focus Session
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Review Progress
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
