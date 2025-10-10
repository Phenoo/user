"use client";

import { TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";

interface StudyAnalyticsProps {
  totalHours: number;
  percentageChange: number;
  dailyHours: number[];
}

export function StudyAnalytics({
  totalHours,
  percentageChange,
  dailyHours,
}: StudyAnalyticsProps) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxHours = Math.max(...dailyHours, 1);

  return (
    <Card className="bg-card border-border p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <CardTitle className="text-sm">Study Analytics</CardTitle>

        <Link
          href="/details"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-6">
        {/* Weekly calendar visualization */}
        <div className="grid grid-cols-7 gap-3 md:gap-4">
          {daysOfWeek.map((day, index) => {
            const hours = dailyHours[index] || 0;
            const heightPercentage = (hours / maxHours) * 100;

            return (
              <div key={day} className="flex flex-col items-center gap-3">
                <span className="text-sm text-muted-foreground">{day}</span>
                <div className="w-full h-32 md:h-40 flex items-end">
                  <div
                    className="w-full bg-primary/20 rounded-lg transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${Math.max(heightPercentage, 10)}%`,
                      minHeight: hours > 0 ? "20%" : "0%",
                    }}
                    title={`${hours.toFixed(1)} hours`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats summary */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-foreground">
            <span className="text-sm ">This week: </span>
            <span className="font-semibold text-sm md:text-base">
              {totalHours.toFixed(1)} hours
            </span>
          </div>
          <div
            className={`text-sm  ${percentageChange >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {percentageChange >= 0 ? "+" : ""}
            {percentageChange}% from last week
          </div>
        </div>
      </div>
    </Card>
  );
}
