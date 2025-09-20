"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import React from "react";
import { StudentDashboard } from "./components/student-dashboard";
import { api } from "@/convex/_generated/api";
import LoadingComponent from "@/components/loader";

const Dashboardpage = () => {
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

  if (!user?.isOnboarding) {
    router.push("/dashboard/onboarding");
  }

  return <StudentDashboard />;
};

export default Dashboardpage;
