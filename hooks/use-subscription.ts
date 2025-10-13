"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe";

export interface SubscriptionStatus {
  plan: "FREE" | "STUDENT" | "PRO";
  status?: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
  isActive: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
  daysUntilExpiry?: number;
}

// export function useSubscription(userId?: Id<"users">) {
//   const subscription = useQuery(
//     api.subscriptions.getUserSubscription,
//     userId ? { userId } : "skip"
//   );

//   if (!subscription) {
//     return {
//       subscription: null,
//       isLoading: true,
//       limits: SUBSCRIPTION_PLANS.FREE.limits,
//       features: SUBSCRIPTION_PLANS.FREE.features,
//     };
//   }

//   const status: SubscriptionStatus = {
//     //@ts-ignore
//     plan: subscription.plan || "PRO",
//     status: subscription.status,
//     //@ts-ignore
//     currentPeriodEnd: subscription.currentPeriodEnd,
//     cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
//     stripeCustomerId: subscription.stripeCustomerId,
//     isActive: ["active", "trialing"].includes(subscription.status || ""),
//     isPastDue: subscription.status === "past_due",
//     isCanceled: ["canceled", "incomplete_expired", "unpaid"].includes(
//       subscription.status || ""
//     ),
//     //@ts-ignore

//     daysUntilExpiry: subscription.currentPeriodEnd
//       ? Math.ceil((0 - Date.now()) / (1000 * 60 * 60 * 24))
//       : undefined,
//   };

//   const planConfig = SUBSCRIPTION_PLANS[status.plan];

//   return {
//     subscription: status,
//     isLoading: false,
//     limits: planConfig.limits,
//     features: planConfig.features,
//     planConfig,
//   };
// }

// export function useSubscriptionLimits(userId?: Id<"users">) {
//   const limits = useQuery(
//     api.subscriptions.checkSubscriptionLimits,
//     userId ? { userId } : "skip"
//   );

//   return {
//     limits,
//     isLoading: !limits,
//     canCreateDeck: limits?.canCreateDeck ?? false,
//     canJoinGroup: limits?.canJoinGroup ?? false,
//   };
// }
