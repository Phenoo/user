"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthToken } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { useConvex } from "convex/react";

type FeatureType =
  | "COURSES_CREATED"
  | "DECKS_CREATED"
  | "CARDS_CREATED"
  | "AI_GENERATIONS"
  | "DATA_EXPORTS"
  | "ANALYTICS_VIEWS"
  | "GOOGLE_MEET_CREATED";

export function useUsageTracking() {
  const convex = useConvex();
  const token = useAuthToken();
  const user = useQuery(api.users.currentUser);
  const userId = user?._id;

  const incrementUsage = useMutation(api.usageTracking.incrementUsage);

  const trackUsage = async (feature: FeatureType) => {
    if (!userId) {
      toast.error("Please log in to track usage");
      return false;
    }

    try {
      // Check if user can perform this action with the actual feature parameter
      const canPerform = await convex.query(api.featureLimits.canPerformAction, {
        userId,
        feature,
      });

      if (canPerform && !canPerform.allowed) {
        toast.error(
          `You've reached your limit for ${feature.toLowerCase().replace(/_/g, " ")}`
        );
        return false;
      }

      // Increment usage
      await incrementUsage({
        userId,
        feature,
      });

      return true;
    } catch (error) {
      console.error("Error tracking usage:", error);
      toast.error("Failed to track usage");
      return false;
    }
  };

  const checkLimit = async (feature: FeatureType) => {
    if (!userId) return { allowed: false, reason: "Not logged in" };

    try {
      const result = await convex.query(api.featureLimits.canPerformAction, {
        userId,
        feature,
      });
      return result;
    } catch (error) {
      console.error("Error checking limit:", error);
      return { allowed: false, reason: "Error checking limits" };
    }
  };

  return {
    trackUsage,
    checkLimit,
    userId,
    user,
  };
}
