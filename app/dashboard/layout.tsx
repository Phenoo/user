"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import HeaderComponent from "./(dashboard)/components/header";
import { api } from "@/convex/_generated/api";
import LoadingComponent from "@/components/loader";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const user = useQuery(api.users.currentUser);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (user === undefined || isLoading) {
    return <LoadingComponent />;
  }

  if (!isAuthenticated) {
    router.push("/auth");
  }

  return (
    <>
      <main className="min-h-screen h-full g-gradient-to-br from-blue-50 to-red-50 dark:from-blue-900 dark:to-red-900">
        {children}
      </main>
    </>
  );
}
