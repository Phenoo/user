import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Clock, Target, Brain } from "lucide-react";
import { SubscriptionGuard } from "@/components/subscription-guard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <Badge variant="secondary">Premium Feature</Badge>
          </div>
          <p className="text-muted-foreground">
            Advanced insights into your study patterns and academic performance
          </p>
        </div>

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
              <div className="text-2xl font-bold">24.5h</div>
              <p className="text-xs text-muted-foreground">This week</p>
              <div className="text-xs text-green-600 mt-1">
                +12% from last week
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
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">Average accuracy</p>
              <div className="text-xs text-green-600 mt-1">+5% improvement</div>
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
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">Total mastered</p>
              <div className="text-xs text-green-600 mt-1">+28 this week</div>
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
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Days in a row</p>
              <div className="text-xs text-green-600 mt-1">Personal best!</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Interactive charts would be displayed here</p>
                  <p className="text-sm">
                    Showing study time, accuracy, and progress over time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    subject: "Computer Science",
                    accuracy: 92,
                    color: "bg-blue-500",
                  },
                  {
                    subject: "Mathematics",
                    accuracy: 85,
                    color: "bg-green-500",
                  },
                  {
                    subject: "Physics",
                    accuracy: 78,
                    color: "bg-purple-500",
                  },
                  {
                    subject: "English",
                    accuracy: 88,
                    color: "bg-orange-500",
                  },
                ].map((item) => (
                  <div key={item.subject} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.subject}</span>
                      <span>{item.accuracy}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
