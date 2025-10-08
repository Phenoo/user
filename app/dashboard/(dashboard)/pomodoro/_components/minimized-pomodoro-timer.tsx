"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePomodoroContext } from "@/contexts/pomodoro-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Maximize2 } from "lucide-react";
import Link from "next/link";

export function MinimizedTimerCard() {
  const pathname = usePathname();
  const {
    sessionType,
    timeLeft,
    selectedCourse,
    isRunning,
    isMinimized,
    setIsMinimized,
    cancelTimer,
  } = usePomodoroContext();

  // Show minimized card when leaving pomodoro page while timer is running
  useEffect(() => {
    const isPomodoroPage = pathname?.includes("/pomodoro");

    if (!isPomodoroPage && isRunning) {
      setIsMinimized(true);
    } else if (isPomodoroPage) {
      setIsMinimized(false);
    }
  }, [pathname, isRunning, setIsMinimized]);

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
        return "Focus";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  if (!isMinimized || !isRunning) {
    return null;
  }

  return (
    <Card className="fixed bottom-6 right-6 p-4 shadow-lg border-2 z-50 min-w-[200px] animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className={`text-xs font-medium ${getSessionColor()}`}>
            {getSessionLabel()}
          </p>
          <p className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</p>
        </div>

        <div className="flex gap-1">
          <Link href={`/dashboard/pomodoro?course=${selectedCourse}`}>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              title="Maximize"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={cancelTimer}
            title="Cancel timer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
