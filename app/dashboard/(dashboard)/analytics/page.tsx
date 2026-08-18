import { AnalyticsContainer } from "./_components/analytics-container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return <AnalyticsContainer />;
}
