"use client";

import Logo from "@/components/logo";
import { MainOnboarding } from "@/components/profile-onboarding";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background max-w-7xl mx-auto p-4">
      <Logo />
      <MainOnboarding />
    </main>
  );
}
