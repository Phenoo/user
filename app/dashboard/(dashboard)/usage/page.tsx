"use client";

import { UsageDashboard } from "@/components/usage-tracking/usage-dashboard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoadingComponent from "@/components/loader";

export default function UsagePage() {
  const user = useQuery(api.users.currentUser);

  if (user === undefined) {
    return <LoadingComponent />;
  }

  if (!user) {
    return <div>Please log in to view usage information.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Usage & Limits</h1>
        <p className="text-muted-foreground">
          Track your usage across all features and see your current limits
        </p>
      </div>

      <UsageDashboard userId={user._id} />
    </div>
  );
}
