"use client";

import { useConvexAuth, useQuery } from "convex/react";
import HeaderComponent from "./components/header";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import LoadingComponent from "@/components/loader";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

  return (
    <>
      <HeaderComponent />
      <div className="min-h-screen h-full g-gradient-to-br from-blue-50 to-red-50 dark:from-blue-900 dark:to-red-900 flex flex-col py-28">
        {children}
      </div>
    </>
  );
}
