/**
 * Default feature limits by subscription plan
 * These values are used to seed the database and can be modified via the admin panel
 * -1 means unlimited
 */

export const FEATURE_NAMES = {
  COURSES_CREATED: "COURSES_CREATED",
  DECKS_CREATED: "DECKS_CREATED",
  CARDS_CREATED: "CARDS_CREATED",
  AI_GENERATIONS: "AI_GENERATIONS",
  DATA_EXPORTS: "DATA_EXPORTS",
  ANALYTICS_VIEWS: "ANALYTICS_VIEWS",
  GOOGLE_MEET_CREATED: "GOOGLE_MEET_CREATED",
} as const;

export type FeatureName = (typeof FEATURE_NAMES)[keyof typeof FEATURE_NAMES];

export const PLAN_NAMES = {
  FREE: "FREE",
  STUDENT: "STUDENT",
  STUDENTPRO: "STUDENTPRO",
} as const;

export type PlanName = (typeof PLAN_NAMES)[keyof typeof PLAN_NAMES];

export const DEFAULT_FEATURE_LIMITS: Record<
  PlanName,
  Record<FeatureName, number>
> = {
  FREE: {
    COURSES_CREATED: 3,
    DECKS_CREATED: 5,
    CARDS_CREATED: 50,
    AI_GENERATIONS: 10,
    DATA_EXPORTS: 1,
    ANALYTICS_VIEWS: 5,
    GOOGLE_MEET_CREATED: 2,
  },
  STUDENT: {
    COURSES_CREATED: 10,
    DECKS_CREATED: 20,
    CARDS_CREATED: 200,
    AI_GENERATIONS: 50,
    DATA_EXPORTS: 5,
    ANALYTICS_VIEWS: -1, // Unlimited
    GOOGLE_MEET_CREATED: 10,
  },
  STUDENTPRO: {
    COURSES_CREATED: -1, // Unlimited
    DECKS_CREATED: -1,
    CARDS_CREATED: -1,
    AI_GENERATIONS: -1,
    DATA_EXPORTS: -1,
    ANALYTICS_VIEWS: -1,
    GOOGLE_MEET_CREATED: -1,
  },
};

/**
 * Human-readable feature descriptions for UI
 */
export const FEATURE_DESCRIPTIONS: Record<FeatureName, string> = {
  COURSES_CREATED: "Courses",
  DECKS_CREATED: "Flashcard Decks",
  CARDS_CREATED: "Flashcards",
  AI_GENERATIONS: "AI Generations",
  DATA_EXPORTS: "Data Exports",
  ANALYTICS_VIEWS: "Analytics Views",
  GOOGLE_MEET_CREATED: "Google Meet Sessions",
};

/**
 * Get the display name for a limit value
 * @param limit - The limit value (-1 means unlimited)
 */
export function formatLimit(limit: number): string {
  return limit === -1 ? "Unlimited" : limit.toString();
}
