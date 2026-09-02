"use client";

import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import LoadingComponent from "@/components/loader";
import { PomodoroProvider } from "@/contexts/pomodoro-context";
import { MinimizedTimerCard } from "./(dashboard)/pomodoro/_components/minimized-pomodoro-timer";
import { FloatingAIChat } from "@/components/global/floating-ai-chat";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const user = useQuery(api.users.currentUser);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (user === undefined) {
    return <LoadingComponent />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PomodoroProvider>
      <main className="min-h-screen h-full g-gradient-to-br from-blue-50 to-red-50 dark:from-blue-900 dark:to-red-900">
        {children}
        <MinimizedTimerCard />
        <FloatingAIChat />
      </main>
    </PomodoroProvider>
  );
}
