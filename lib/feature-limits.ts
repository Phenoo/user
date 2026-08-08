export type SubscriptionPlan = "FREE" | "STUDENT" | "STUDENTPRO";

// Mock user type for demonstration
export interface MockUser {
  _id: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "trialing"
    | "unpaid";
  endsOn?: number;
  stripeCustomerId?: string;
}

export interface FeatureLimits {
  maxCourses: number;
  maxFlashcardDecks: number;
  maxFlashcardsPerDeck: number;
  maxStudyGroups: number;
  canAccessAdvancedAnalytics: boolean;
  canExportData: boolean;
  canCreatePublicDecks: boolean;
  canAccessAIFeatures: boolean;
  maxFileUploads: number;
  maxStorageGB: number;
}

export const FEATURE_LIMITS: Record<SubscriptionPlan, FeatureLimits> = {
  FREE: {
    maxCourses: 1,
    maxFlashcardDecks: 2,
    maxFlashcardsPerDeck: 15,
    maxStudyGroups: 1,
    canAccessAdvancedAnalytics: false,
    canExportData: false,
    canCreatePublicDecks: false,
    canAccessAIFeatures: false,
    maxFileUploads: 2,
    maxStorageGB: 0.05,
  },
  STUDENT: {
    maxCourses: 5,
    maxFlashcardDecks: 10,
    maxFlashcardsPerDeck: 50,
    maxStudyGroups: 3,
    canAccessAdvancedAnalytics: true,
    canExportData: true,
    canCreatePublicDecks: true,
    canAccessAIFeatures: false,
    maxFileUploads: 10,
    maxStorageGB: 0.5,
  },

  STUDENTPRO: {
    maxCourses: -1, // unlimited
    maxFlashcardDecks: -1, // unlimited
    maxFlashcardsPerDeck: -1, // unlimited
    maxStudyGroups: -1, // unlimited
    canAccessAdvancedAnalytics: true,
    canExportData: true,
    canCreatePublicDecks: true,
    canAccessAIFeatures: true,
    maxFileUploads: -1, // unlimited
    maxStorageGB: 10,
  },
};

export function getFeatureLimits(
  subscriptionPlan: SubscriptionPlan = "FREE"
): FeatureLimits {
  return FEATURE_LIMITS[subscriptionPlan];
}

export function isFeatureAllowed(
  user: MockUser | null,
  feature: keyof FeatureLimits
): boolean {
  if (!user) return false;

  const plan = user.subscriptionPlan || "FREE";
  const limits = getFeatureLimits(plan);

  return limits[feature] as boolean;
}

export function getFeatureLimit(
  user: MockUser | null,
  feature: keyof FeatureLimits
): number {
  if (!user) return 0;

  const plan = user.subscriptionPlan || "FREE";
  const limits = getFeatureLimits(plan);

  return limits[feature] as number;
}

export function canCreateMore(
  user: MockUser | null,
  feature: keyof FeatureLimits,
  currentCount: number
): boolean {
  if (!user) return false;

  const limit = getFeatureLimit(user, feature);

  // -1 means unlimited
  if (limit === -1) return true;

  return currentCount < limit;
}

export function getRemainingCount(
  user: MockUser | null,
  feature: keyof FeatureLimits,
  currentCount: number
): number | "unlimited" {
  if (!user) return 0;

  const limit = getFeatureLimit(user, feature);

  // -1 means unlimited
  if (limit === -1) return "unlimited";

  return Math.max(0, limit - currentCount);
}

export function isSubscriptionActive(user: MockUser | null): boolean {
  if (!user) return false;

  const now = Date.now();
  const endsOn = user.endsOn;

  if (!endsOn) return false;

  return now < endsOn && user.subscriptionStatus === "active";
}

export function getSubscriptionStatusMessage(user: MockUser | null): string {
  if (!user) return "Not authenticated";

  if (!user.subscriptionPlan || user.subscriptionPlan === "FREE") {
    return "Free plan";
  }

  if (!isSubscriptionActive(user)) {
    return "Subscription expired";
  }

  const planNames = {
    STUDENT: "Student Plan",
    STUDENT_YEAR: "Student Plan (Yearly)",
    STUDENTPRO: "Student Pro Plan",
    STUDENTPRO_YEAR: "Student Pro Plan (Yearly)",
  };

  return (
    planNames[user.subscriptionPlan as keyof typeof planNames] || "Unknown plan"
  );
}
