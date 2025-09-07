"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import HeaderComponent from "./(dashboard)/components/header";
import { api } from "@/convex/_generated/api";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const user = useQuery(api.users.currentUser);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user?.isOnboarding) {
    router.push("/dashboard/onboarding");
  }

  return (
    <>
      <main className="min-h-screen h-full g-gradient-to-br from-blue-50 to-red-50 dark:from-blue-900 dark:to-red-900">
        {children}
      </main>
    </>
  );
}
