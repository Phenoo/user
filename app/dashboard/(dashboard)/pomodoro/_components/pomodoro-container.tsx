"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Clock, Flame, TrendingUp } from "lucide-react";
import { StudyAnalytics } from "./study-analytics";
import { PomodoroTimer } from "./pomodoro-timer";
import { Course } from "../../courses/_components/courses-container";
import { Id } from "@/convex/_generated/dataModel";

const PomodoroPageContainer = () => {
  const user = useQuery(api.users.currentUser);

  const todayStats = useQuery(api.sessions.getTodayStats, {
    userId: user?._id as Id<"users">,
  });
  const weeklyStats = useQuery(api.sessions.getWeeklyStats, {
    userId: user?._id as Id<"users">,
  });

  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(
    undefined
  );

  const settings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(undefined);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 space-y-8">
      {/* Main Timer */}
      <div className="flex justify-center">
        <PomodoroTimer settings={settings} onSessionComplete={() => {}} />
      </div>
      {todayStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Pomodoros Today
              </h3>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {todayStats.pomodorosCompleted}
            </p>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Focus Time Today
              </h3>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {(todayStats.totalMinutes / 60).toFixed(1)}h
            </p>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Current Streak
              </h3>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {todayStats.pomodorosCompleted}
            </p>
          </Card>
        </div>
      )}
      {weeklyStats && (
        <StudyAnalytics
          totalHours={weeklyStats.totalHours}
          percentageChange={15}
          dailyHours={weeklyStats.dailyHours}
        />
      )}
    </div>
  );
};

export default PomodoroPageContainer;
