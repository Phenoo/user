"use client";

import LoadingComponent from "@/components/loader";
import Logo from "@/components/logo";
import { MainOnboarding } from "@/components/profile-onboarding";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);

  if (user === undefined) {
    return <LoadingComponent />;
  }

  // if (user?.isOnboarding) {
  //   router.replace("/dashboard");
  // }

  return (
    <main className="min-h-screen bg-background max-w-7xl mx-auto p-0.5 md:p-4">
      <Logo />
      <MainOnboarding />
    </main>
  );
}
