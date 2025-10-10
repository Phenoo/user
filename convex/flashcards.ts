import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's flashcard decks
export const getUserDecks = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flashcardDecks")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .collect();
  },
});

export const getUserDecksByCourseId = query({
  args: { courseId: v.id("courses"), userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flashcardDecks")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .filter((q) => q.or(q.eq(q.field("courseId"), args.courseId)))
      .collect();
  },
});

// Get flashcards in a deck
export const getDeckCards = query({
  args: { deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flashcards")
      .withIndex("by_deckId", (q) => q.eq("deckId", args.deckId))
      .collect();
  },
});

export const getCards = query({
  args: { userId: v.id("users"), deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flashcards")
      .withIndex("by_deckId", (q) => q.eq("deckId", args.deckId))
      .collect();
  },
});

// Create flashcard deck
export const createDeck = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    courseId: v.id("courses"),
    userId: v.id("users"),
    createdBy: v.id("users"),
    difficulty: v.union(
      v.literal("Easy"),
      v.literal("Medium"),
      v.literal("Hard")
    ),
    color: v.string(),
    isPublic: v.boolean(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const course = await ctx.db
      .query("courses")
      .withIndex("by_id", (q) => q.eq("_id", args.courseId))
      .collect();

    if (!course) {
      throw new Error("Course not found");
    }

    return await ctx.db.insert("flashcardDecks", {
      ...updates,
      subject: course[0].code,
      totalCards: 0,
      masteredCards: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Create flashcard
export const createFlashcard = mutation({
  args: {
    userId: v.id("users"),
    deckId: v.id("flashcardDecks"),
    front: v.string(),
    back: v.string(),
    imageUrl: v.optional(v.string()),
    difficulty: v.union(
      v.literal("Easy"),
      v.literal("Medium"),
      v.literal("Hard")
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const cardId = await ctx.db.insert("flashcards", {
      ...args,
      timesCorrect: 0,
      timesIncorrect: 0,
      isMastered: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update deck card count
    const deck = await ctx.db.get(args.deckId);
    if (deck) {
      await ctx.db.patch(args.deckId, {
        totalCards: deck.totalCards + 1,
        updatedAt: Date.now(),
      });
    }

    return cardId;
  },
});

export const deleteFlashcard = mutation({
  args: {
    cardId: v.id("flashcards"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    // Verify ownership
    if (card.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Delete the card
    await ctx.db.delete(args.cardId);

    // Update deck card count
    const deck = await ctx.db.get(card.deckId);
    if (deck) {
      const newTotalCards = Math.max(0, deck.totalCards - 1);
      const newMasteredCards = card.isMastered
        ? Math.max(0, deck.masteredCards - 1)
        : deck.masteredCards;

      await ctx.db.patch(card.deckId, {
        totalCards: newTotalCards,
        masteredCards: newMasteredCards,
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});

export const updateCardPerformance = mutation({
  args: {
    cardId: v.id("flashcards"),
    isCorrect: v.optional(v.boolean()),
    confidence: v.optional(
      v.union(v.literal("hard"), v.literal("good"), v.literal("easy"))
    ),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    const updates: any = {
      lastStudied: Date.now(),
      updatedAt: Date.now(),
    };

    if (args.confidence) {
      updates.confidence = args.confidence;

      // Calculate next review date based on confidence
      const intervals = {
        hard: 1000 * 60 * 60 * 4, // 4 hours
        good: 1000 * 60 * 60 * 24, // 1 day
        easy: 1000 * 60 * 60 * 24 * 7, // 7 days
      };

      updates.nextReviewDate = Date.now() + intervals[args.confidence];

      // Update correct/incorrect counts based on confidence
      if (args.confidence === "hard") {
        updates.timesIncorrect = card.timesIncorrect + 1;
      } else {
        updates.timesCorrect = card.timesCorrect + 1;
      }

      // Mark as mastered if confidence is "easy"
      if (args.confidence === "easy" && !card.isMastered) {
        updates.isMastered = true;
        updates.masteredAt = Date.now();
      } else if (args.confidence === "hard" && card.isMastered) {
        // Unmaster if answered with "hard"
        updates.isMastered = false;
        updates.masteredAt = undefined;
      }
    }
    // Legacy support for isCorrect parameter
    else if (args.isCorrect !== undefined) {
      if (args.isCorrect) {
        updates.timesCorrect = card.timesCorrect + 1;
        // Mark as mastered if answered correctly 3+ times
        if (card.timesCorrect + 1 >= 3 && !card.isMastered) {
          updates.isMastered = true;
          updates.masteredAt = Date.now();
        }
      } else {
        updates.timesIncorrect = card.timesIncorrect + 1;
        // Unmaster if answered incorrectly
        if (card.isMastered) {
          updates.isMastered = false;
          updates.masteredAt = undefined;
        }
      }
    }

    await ctx.db.patch(args.cardId, updates);

    // Update deck mastery count if needed
    if (updates.isMastered !== undefined) {
      const deck = await ctx.db.get(card.deckId);
      if (deck) {
        const masteredChange = updates.isMastered ? 1 : -1;
        await ctx.db.patch(card.deckId, {
          masteredCards: Math.max(0, deck.masteredCards + masteredChange),
          updatedAt: Date.now(),
        });
      }
    }

    return true;
  },
});

export const getCardsDueForReview = query({
  args: {
    deckId: v.id("flashcardDecks"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_deckId", (q) => q.eq("deckId", args.deckId))
      .collect();

    // Return cards that are due for review or haven't been reviewed yet
    return cards.filter(
      (card) =>
        card.userId === args.userId &&
        !card.isMastered &&
        (!card.nextReviewDate || card.nextReviewDate <= now)
    );
  },
});

// Get all public flashcard decks
export const getPublicDecks = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("flashcardDecks")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .collect();
  },
});

// Get single flashcard deck with details
export const getDeck = query({
  args: { deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    if (!deck) return null;

    const creator = await ctx.db.get(deck.createdBy);
    const course = deck.courseId ? await ctx.db.get(deck.courseId) : null;

    return { ...deck, creator, course };
  },
});

// Get single flashcard
export const getFlashcard = query({
  args: { cardId: v.id("flashcards") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.cardId);
  },
});

// Start study session
export const startStudySession = mutation({
  args: {
    userId: v.id("users"),
    deckId: v.id("flashcardDecks"),
    sessionType: v.union(
      v.literal("all"),
      v.literal("unmastered"),
      v.literal("review")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("studySessions", {
      ...args,
      cardsStudied: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      duration: 0,
      createdAt: Date.now(),
    });
  },
});

// End study session
export const endStudySession = mutation({
  args: {
    sessionId: v.id("studySessions"),
    cardsStudied: v.number(),
    correctAnswers: v.number(),
    incorrectAnswers: v.number(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const accuracy =
      args.cardsStudied > 0
        ? (args.correctAnswers / args.cardsStudied) * 100
        : 0;

    await ctx.db.patch(args.sessionId, {
      cardsStudied: args.cardsStudied,
      correctAnswers: args.correctAnswers,
      incorrectAnswers: args.incorrectAnswers,
      accuracy,
      duration: args.duration,
    });

    return true;
  },
});

// Get user study statistics
export const getUserStudyStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("studySessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const totalSessions = sessions.length;
    const totalCardsStudied = sessions.reduce(
      (sum, s) => sum + s.cardsStudied,
      0
    );
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageAccuracy =
      totalCardsStudied > 0 ? (totalCorrect / totalCardsStudied) * 100 : 0;

    return {
      totalSessions,
      totalCardsStudied,
      totalCorrect,
      totalStudyTime,
      averageAccuracy,
    };
  },
});

// Delete flashcard deck
export const deleteDeck = mutation({
  args: { deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    // Delete all cards in the deck
    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_deckId", (q) => q.eq("deckId", args.deckId))
      .collect();

    for (const card of cards) {
      await ctx.db.delete(card._id);
    }

    // Delete the deck
    await ctx.db.delete(args.deckId);
    return true;
  },
});

// Update flashcard
export const updateFlashcard = mutation({
  args: {
    cardId: v.id("flashcards"),
    front: v.string(),
    back: v.string(),
    imageUrl: v.optional(v.string()),
    difficulty: v.union(
      v.literal("Easy"),
      v.literal("Medium"),
      v.literal("Hard")
    ),
  },
  handler: async (ctx, args) => {
    const { cardId, ...updates } = args;
    await ctx.db.patch(cardId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  },
});
