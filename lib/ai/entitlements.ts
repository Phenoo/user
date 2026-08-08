export type SubscriptionPlan = "FREE" | "STUDENT" | "STUDENTPRO";

export interface AIPlanEntitlement {
  monthlyCredits: number;
  allowDeepReasoning: boolean;
  maxTokensPerRequest: number;
}

export const PLAN_ENTITLEMENTS: Record<SubscriptionPlan, AIPlanEntitlement> = {
  FREE: {
    monthlyCredits: 100,
    allowDeepReasoning: false,
    maxTokensPerRequest: 4096,
  },
  STUDENT: {
    monthlyCredits: 500,
    allowDeepReasoning: false,
    maxTokensPerRequest: 8192,
  },
  STUDENTPRO: {
    monthlyCredits: 2000,
    allowDeepReasoning: true,
    maxTokensPerRequest: 16384,
  },
};

export const FEATURE_CREDIT_COSTS: Record<string, number> = {
  chat: 1,
  summary: 2,
  flashcards: 3,
  essay: 5,
  "study-guide": 3,
  "assignment-parser": 2,
  "deep-reasoning": 10,
};

export function getFeatureCreditCost(feature: string, mode?: string): number {
  if (mode === "deep-reasoning") {
    return FEATURE_CREDIT_COSTS["deep-reasoning"];
  }
  return FEATURE_CREDIT_COSTS[feature] ?? 1;
}

export const getCreditsForRequest = getFeatureCreditCost;

export interface PlanEntitlementsFull {
  plan: SubscriptionPlan;
  ai: {
    monthlyCredits: number;
    deepReasoning: boolean;
    maxTokensPerRequest: number;
  };
  courses: {
    max: number;
  };
  documents: {
    maxPerCourse: number;
  };
  storage: {
    bytes: number;
  };
  studyGroups: {
    maxOwned: number;
  };
}

export const FULL_PLAN_ENTITLEMENTS: Record<SubscriptionPlan, PlanEntitlementsFull> = {
  FREE: {
    plan: "FREE",
    ai: {
      monthlyCredits: 100,
      deepReasoning: false,
      maxTokensPerRequest: 4096,
    },
    courses: { max: 3 },
    documents: { maxPerCourse: 10 },
    storage: { bytes: 50 * 1024 * 1024 },
    studyGroups: { maxOwned: 2 },
  },
  STUDENT: {
    plan: "STUDENT",
    ai: {
      monthlyCredits: 500,
      deepReasoning: false,
      maxTokensPerRequest: 8192,
    },
    courses: { max: 10 },
    documents: { maxPerCourse: 50 },
    storage: { bytes: 500 * 1024 * 1024 },
    studyGroups: { maxOwned: 10 },
  },
  STUDENTPRO: {
    plan: "STUDENTPRO",
    ai: {
      monthlyCredits: 2000,
      deepReasoning: true,
      maxTokensPerRequest: 16384,
    },
    courses: { max: 999 },
    documents: { maxPerCourse: 500 },
    storage: { bytes: 5 * 1024 * 1024 * 1024 },
    studyGroups: { maxOwned: 999 },
  },
};

export function getPlanEntitlements(plan: SubscriptionPlan = "FREE"): AIPlanEntitlement {
  return PLAN_ENTITLEMENTS[plan] || PLAN_ENTITLEMENTS.FREE;
}

export function getEntitlementsForPlan(plan: SubscriptionPlan = "FREE"): PlanEntitlementsFull {
  return FULL_PLAN_ENTITLEMENTS[plan] || FULL_PLAN_ENTITLEMENTS.FREE;
}

export function getMonthlyResetDate(now: Date = new Date()): Date {
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  return nextMonth;
}

