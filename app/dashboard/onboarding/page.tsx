import React from "react";

import OnboardingContainer from "./_components/onboarding-container";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding",
};

const OnboardingPage = () => {
  return <OnboardingContainer />;
};

export default OnboardingPage;
