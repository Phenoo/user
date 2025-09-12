import Stripe from "stripe";

if (!process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null,
    features: [
      "Up to 5 flashcard decks",
      "Basic study groups",
      "Limited analytics",
      "Community support",
    ],
    limits: {
      flashcardDecks: 5,
      studyGroups: 2,
      cardsPerDeck: 50,
    },
  },
  STUDENT: {
    name: "Student",
    price: 9.99,
    priceId: process.env.STRIPE_STUDENT_PRICE_ID,
    features: [
      "Unlimited flashcard decks",
      "Advanced study groups",
      "Detailed analytics",
      "Priority support",
      "AI-powered study recommendations",
    ],
    limits: {
      flashcardDecks: -1, // unlimited
      studyGroups: -1,
      cardsPerDeck: -1,
    },
  },
  PRO: {
    name: "Pro",
    price: 19.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Everything in Student",
      "Team collaboration tools",
      "Advanced analytics dashboard",
      "Custom branding",
      "API access",
      "Dedicated support",
    ],
    limits: {
      flashcardDecks: -1,
      studyGroups: -1,
      cardsPerDeck: -1,
      teamMembers: 50,
    },
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
