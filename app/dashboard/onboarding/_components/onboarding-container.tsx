"use client";

import LoadingComponent from "@/components/loader";
import Logo from "@/components/logo";
import { MainOnboarding } from "@/components/profile-onboarding";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function OnboardingContainer() {
  const user = useQuery(api.users.currentUser);

  if (user === undefined) {
    return <LoadingComponent />;
  }

  return (
    <main className="min-h-screen bg-background max-w-7xl mx-auto p-0.5 md:p-4">
      <Logo />
      <MainOnboarding />
    </main>
  );
}
