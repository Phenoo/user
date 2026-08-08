"use client";

export interface SubscriptionStatus {
  plan: "FREE" | "STUDENT" | "PRO";
  status?: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  isActive: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
  daysUntilExpiry?: number;
}
