"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import CoursesSelect from "@/components/courses-select";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { usePomodoroContext } from "@/contexts/pomodoro-context";

type SessionType = "focus" | "shortBreak" | "longBreak";

interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
}

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onSessionComplete: () => void;
}

export function PomodoroTimer({
  settings: propSettings,
  onSessionComplete,
}: PomodoroTimerProps) {
  const createSession = useMutation(api.sessions.create);
  const router = useRouter();

  const {
    sessionType,
    timeLeft,
    isRunning,
    completedSessions,
    selectedCourse,
    settings,
    totalTime,
    setSessionType,
    setTimeLeft,
    setIsRunning,
    setCompletedSessions,
    setSelectedCourse,
    setSettings,
  } = usePomodoroContext();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const searchParams = useSearchParams().get("course");

  const user = useQuery(api.users.currentUser);

  useEffect(() => {
    setSettings(propSettings);
  }, [propSettings, setSettings]);

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/notification.mp3");
    }
  }, []);

  useEffect(() => {
    setSelectedCourse(searchParams as string);
  }, [searchParams]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        //@ts-ignore
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    setIsRunning(false);

    // Play notification sound
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if (selectedCourse && sessionType === "focus") {
      const convexType =
        sessionType === "focus"
          ? "pomodoro"
          : sessionType === "shortBreak"
            ? "shortBreak"
            : "longBreak";
      await createSession({
        courseId: selectedCourse as Id<"courses">,
        type: convexType,
        duration: totalTime / 60,
        userId: user?._id as Id<"users">,
      });
    }

    onSessionComplete();

    // Auto-switch to next session type
    if (sessionType === "focus") {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
        setSessionType("longBreak");
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setSessionType("shortBreak");
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      setSessionType("focus");
      setTimeLeft(settings.focusDuration * 60);
    }
  };

  const toggleTimer = () => {
    if (selectedCourse === "") {
      toast.error("Select a course");

      return;
    }

    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const switchSessionType = (type: SessionType) => {
    setIsRunning(false);
    setSessionType(type);
    const duration =
      type === "focus"
        ? settings.focusDuration
        : type === "shortBreak"
          ? settings.shortBreakDuration
          : settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case "focus":
        return "text-amber-500";
      case "shortBreak":
        return "text-emerald-500";
      case "longBreak":
        return "text-blue-500";
    }
  };

  const getSessionLabel = () => {
    switch (sessionType) {
      case "focus":
        return "Focus Time";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <CoursesSelect
        course={searchParams || selectedCourse}
        onChange={(e) => {
          router.push(`/dashboard/pomodoro?course=${e}`);
          setSelectedCourse(e);
        }}
      />

      {/* Session Type Selector */}
      <div className="flex gap-2 bg-card border border-border rounded-lg p-1">
        <Button
          variant={sessionType === "focus" ? "default" : "ghost"}
          size="sm"
          onClick={() => switchSessionType("focus")}
          disabled={isRunning}
        >
          Focus
        </Button>
        <Button
          variant={sessionType === "shortBreak" ? "default" : "ghost"}
          size="sm"
          onClick={() => switchSessionType("shortBreak")}
          disabled={isRunning}
        >
          Short Break
        </Button>
        <Button
          variant={sessionType === "longBreak" ? "default" : "ghost"}
          size="sm"
          onClick={() => switchSessionType("longBreak")}
          disabled={isRunning}
        >
          Long Break
        </Button>
      </div>

      {/* Circular Timer */}
      <div className="relative">
        <svg
          className="w-72 h-72 md:w-80 md:h-80 -rotate-90"
          viewBox="0 0 200 200"
        >
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className={`text-sm font-medium mb-2 ${getSessionColor()}`}>
            {getSessionLabel()}
          </p>
          <p className="text-6xl md:text-7xl font-bold text-foreground font-mono">
            {formatTime(timeLeft)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {completedSessions % settings.sessionsUntilLongBreak}/
            {settings.sessionsUntilLongBreak} until long break
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button size="lg" onClick={toggleTimer} className="gap-2 min-w-32">
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={resetTimer}
          className="gap-2 bg-transparent"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </Button>
        <Link href="/dashboard/settings?section=timer">
          <Button size="lg" variant="outline" className="gap-2 bg-transparent">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Motivational message */}
      <div className="text-center max-w-md">
        <p className="text-muted-foreground italic">
          {sessionType === "focus"
            ? '"The secret of getting ahead is getting started."'
            : "Take a deep breath and relax. You're doing great!"}
        </p>
      </div>
    </div>
  );
}
