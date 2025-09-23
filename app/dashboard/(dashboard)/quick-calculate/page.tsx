import React from "react";
import GPACalculator from "./_components/quick-calculate-container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Calculate",
};

const QuickCalculatePage = () => {
  return <GPACalculator />;
};

export default QuickCalculatePage;
