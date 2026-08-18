import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import type { Doc, Id } from "./_generated/dataModel";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

type Rating = "again" | "hard" | "good" | "easy";
type StudyMode = "due" | "all" | "learning" | "cram";

async function getAuthenticatedUser(ctx: any): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Not authenticated");

  const userId = await auth.getUserId(ctx);
  if (!userId) throw new ConvexError("User not found");

  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError("User not found");
  return user;
}

async function assertDeckAccess(
  ctx: any,
  deckId: Id<"flashcardDecks">,
  userId: Id<"users">
) {
  const deck = await ctx.db.get(deckId);
  if (!deck || deck.createdBy !== userId) {
    throw new ConvexError("Deck not found or unauthorized access");
  }
  return deck;
}

async function assertCardAccess(
  ctx: any,
  cardId: Id<"flashcards">,
  userId: Id<"users">
) {
  const card = await ctx.db.get(cardId);
  if (!card || card.userId !== userId) {
    throw new ConvexError("Card not found or unauthorized access");
  }
  await assertDeckAccess(ctx, card.deckId, userId);
  return card;
}

function planCardLimit(user: Doc<"users">) {
  if (user.subscriptionPlan === "STUDENTPRO") return Infinity;
  if (user.subscriptionPlan === "STUDENT") return 50;
  return 15;
}

function isMastered(card: any, state: string, rating: Rating) {
  if (rating === "again") return false;
  return state === "review" && (card.stability ?? 0) >= 21 && (card.reps ?? 0) >= 3;
}

function scheduleCard(card: any, rating: Rating, now: number) {
  const previousState = card.state ?? (card.timesCorrect > 0 ? "review" : "new");
  const previousStability = Math.max(0.1, card.stability ?? (previousState === "new" ? 0.4 : 1));
  const previousDifficulty = card.memoryDifficulty ?? 5;
  const previousReps = card.reps ?? card.timesCorrect ?? 0;
  const previousLapses = card.lapses ?? 0;
  const elapsedDays = card.lastReview ? Math.max(0, (now - card.lastReview) / DAY) : 0;

  let state: "new" | "learning" | "review" | "relearning" = previousState;
  let stability = previousStability;
  let memoryDifficulty = previousDifficulty;
  let reps = previousReps;
  let lapses = previousLapses;
  let intervalDays = 0;

  if (rating === "again") {
    state = previousState === "new" ? "learning" : "relearning";
    stability = Math.max(0.25, previousStability * 0.35);
    memoryDifficulty = Math.min(10, previousDifficulty + 0.8);
    lapses += 1;
    intervalDays = 10 / (24 * 60); // ten minutes
  } else {
    reps += 1;
    const growth = rating === "hard" ? 1.18 : rating === "good" ? 1.65 : 2.25;
    const difficultyAdjustment = rating === "hard" ? 0.35 : rating === "easy" ? -0.35 : 0;
    memoryDifficulty = Math.max(1, Math.min(10, previousDifficulty + difficultyAdjustment));
    stability = Math.max(0.5, previousStability * growth + (rating === "easy" ? 1.2 : 0.2));

    if (rating === "hard") {
      state = previousState === "new" ? "learning" : previousState === "relearning" ? "relearning" : "review";
      intervalDays = previousState === "new" || previousState === "relearning" ? 1 : Math.max(1, Math.min(6, stability * 0.35));
    } else {
      state = "review";
      intervalDays = Math.max(1, Math.round(stability * (rating === "easy" ? 1.35 : 0.85)));
    }
  }

  const nextDue = now + intervalDays * DAY;
  return {
    previousState,
    state,
    stability,
    memoryDifficulty,
    reps,
    lapses,
    elapsedDays,
    scheduledDays: intervalDays,
    due: nextDue,
    nextReviewDate: nextDue,
    lastReview: now,
    isMastered: isMastered({ ...card, stability, reps }, state, rating),
  };
}

async function collectUserCards(ctx: any, userId: Id<"users">) {
  return await ctx.db
    .query("flashcards")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect();
}

async function buildQueue(
  ctx: any,
  userId: Id<"users">,
  args: { deckId?: Id<"flashcardDecks">; courseId?: Id<"courses">; mode: StudyMode; limit?: number }
) {
  const now = Date.now();
  const decks = await ctx.db
    .query("flashcardDecks")
    .withIndex("by_creator", (q: any) => q.eq("createdBy", userId))
    .collect();
  const allowedDeckIds = new Set(
    decks
      .filter((deck: any) => (!args.deckId || deck._id === args.deckId) && (!args.courseId || deck.courseId === args.courseId))
      .map((deck: any) => deck._id)
  );

  let cards = (await collectUserCards(ctx, userId)).filter(
    (card: any) => allowedDeckIds.has(card.deckId) && !card.suspended && !card.buried
  );

  if (args.mode === "due") {
    cards = cards.filter((card: any) => !card.due && !card.nextReviewDate || (card.due ?? card.nextReviewDate) <= now);
  } else if (args.mode === "learning") {
    cards = cards.filter((card: any) => card.state === "learning" || card.state === "relearning");
  }

  cards.sort((a: any, b: any) => {
    const aDue = a.due ?? a.nextReviewDate ?? 0;
    const bDue = b.due ?? b.nextReviewDate ?? 0;
    const aState = a.state === "relearning" ? 0 : a.state === "learning" ? 1 : a.state === "review" ? 2 : 3;
    const bState = b.state === "relearning" ? 0 : b.state === "learning" ? 1 : b.state === "review" ? 2 : 3;
    return aState - bState || aDue - bDue;
  });

  return cards.slice(0, Math.min(Math.max(args.limit ?? 50, 1), 200));
}

export const getUserDecks = query({
  args: { userId: v.id("users") },
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    return await ctx.db
      .query("flashcardDecks")
      .withIndex("by_creator", (q) => q.eq("createdBy", user._id))
      .order("desc")
      .collect();
  },
});

export const getUserDecksByCourseId = query({
  args: { courseId: v.id("courses"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    return await ctx.db
      .query("flashcardDecks")
      .withIndex("by_creator", (q) => q.eq("createdBy", user._id))
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();
  },
});

export const getDeckCards = query({
  args: { deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await assertDeckAccess(ctx, args.deckId, user._id);
    return await ctx.db.query("flashcards").withIndex("by_deckId", (q) => q.eq("deckId", args.deckId)).order("asc").collect();
  },
});

export const getCards = query({
  args: { userId: v.id("users"), deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await assertDeckAccess(ctx, args.deckId, user._id);
    return await ctx.db.query("flashcards").withIndex("by_deckId", (q) => q.eq("deckId", args.deckId)).collect();
  },
});

export const getFlashcardOverview = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    const [decks, cards] = await Promise.all([
      ctx.db.query("flashcardDecks").withIndex("by_creator", (q: any) => q.eq("createdBy", user._id)).order("desc").collect(),
      collectUserCards(ctx, user._id),
    ]);
    const now = Date.now();
    const stats = (deckId?: Id<"flashcardDecks">) => {
      const deckCards = cards.filter((card: any) => !deckId || card.deckId === deckId);
      const due = deckCards.filter((card: any) => !card.suspended && (!card.due && !card.nextReviewDate || (card.due ?? card.nextReviewDate) <= now)).length;
      const learning = deckCards.filter((card: any) => card.state === "learning" || card.state === "relearning").length;
      const mature = deckCards.filter((card: any) => card.state === "review" && (card.stability ?? 0) >= 21).length;
      return { total: deckCards.length, due, learning, mature, reviews: deckCards.reduce((sum: number, card: any) => sum + (card.reps ?? card.timesCorrect ?? 0), 0) };
    };
    return { summary: stats(), decks: decks.map((deck: any) => ({ ...deck, stats: stats(deck._id) })) };
  },
});

export const createDeck = mutation({
  args: {
    name: v.string(), description: v.string(), courseId: v.id("courses"), userId: v.id("users"), createdBy: v.id("users"),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")), color: v.string(), isPublic: v.boolean(), tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== user._id) throw new ConvexError("Course not found or unauthorized access");
    if (args.isPublic && user.subscriptionPlan === "FREE") throw new ConvexError("Public decks require a paid plan");
    return await ctx.db.insert("flashcardDecks", {
      name: args.name.trim(), description: args.description.trim(), courseId: args.courseId, createdBy: user._id,
      subject: course.code, totalCards: 0, masteredCards: 0, color: args.color, isPublic: args.isPublic,
      tags: args.tags, createdAt: Date.now(), updatedAt: Date.now(), difficulty: args.difficulty,
    });
  },
});

export const createDeckWithGeneratedCards = mutation({
  args: {
    userId: v.id("users"), name: v.string(), description: v.string(), courseId: v.id("courses"),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")), color: v.string(),
    cards: v.array(v.object({ front: v.string(), back: v.string(), difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")), cardType: v.optional(v.union(v.literal("basic"), v.literal("cloze"), v.literal("basic_reversed"))), tags: v.optional(v.array(v.string())), explanation: v.optional(v.string()), sourceLabel: v.optional(v.string()) })),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== user._id) throw new ConvexError("Course not found or unauthorized access");
    const limit = planCardLimit(user);
    if (args.cards.length > limit) throw new ConvexError(`Your plan supports up to ${limit === Infinity ? "unlimited" : limit} cards per deck.`);

    const now = Date.now();
    const deckId = await ctx.db.insert("flashcardDecks", {
      name: args.name.trim(), description: args.description.trim(), courseId: args.courseId, createdBy: user._id,
      subject: course.code || course.name, difficulty: args.difficulty, totalCards: args.cards.length, masteredCards: 0,
      color: args.color, isPublic: false, tags: ["ai-generated"], createdAt: now, updatedAt: now,
    });
    for (const card of args.cards.slice(0, limit === Infinity ? undefined : limit)) {
      await ctx.db.insert("flashcards", { userId: user._id, deckId, front: card.front.trim(), back: card.back.trim(), difficulty: card.difficulty, cardType: card.cardType ?? "basic", tags: card.tags ?? [], explanation: card.explanation, sourceLabel: card.sourceLabel, timesCorrect: 0, timesIncorrect: 0, isMastered: false, state: "new", due: now, reps: 0, lapses: 0, stability: 0.4, memoryDifficulty: 5, suspended: false, buried: false, createdAt: now, updatedAt: now });
    }
    return deckId;
  },
});

export const createFlashcard = mutation({
  args: {
    userId: v.id("users"), deckId: v.id("flashcardDecks"), front: v.string(), back: v.string(), imageUrl: v.optional(v.string()),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")), cardType: v.optional(v.union(v.literal("basic"), v.literal("cloze"), v.literal("basic_reversed"))), tags: v.optional(v.array(v.string())), explanation: v.optional(v.string()), sourceType: v.optional(v.string()), sourceId: v.optional(v.string()), sourceLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const deck = await assertDeckAccess(ctx, args.deckId, user._id);
    const cards = await ctx.db.query("flashcards").withIndex("by_deckId", (q) => q.eq("deckId", args.deckId)).collect();
    const limit = planCardLimit(user);
    if (cards.length >= limit) throw new ConvexError("This deck has reached your plan's card limit.");
    const now = Date.now();
    const cardId = await ctx.db.insert("flashcards", { ...args, userId: user._id, front: args.front.trim(), back: args.back.trim(), cardType: args.cardType ?? "basic", tags: args.tags ?? [], timesCorrect: 0, timesIncorrect: 0, isMastered: false, state: "new", due: now, reps: 0, lapses: 0, stability: 0.4, memoryDifficulty: 5, suspended: false, buried: false, createdAt: now, updatedAt: now });
    await ctx.db.patch(deck._id, { totalCards: cards.length + 1, updatedAt: now });
    return cardId;
  },
});

export const updateFlashcard = mutation({
  args: { cardId: v.id("flashcards"), front: v.string(), back: v.string(), imageUrl: v.optional(v.string()), difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")), cardType: v.optional(v.union(v.literal("basic"), v.literal("cloze"), v.literal("basic_reversed"))), tags: v.optional(v.array(v.string())), explanation: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await assertCardAccess(ctx, args.cardId, user._id);
    const { cardId, ...updates } = args;
    await ctx.db.patch(cardId, { ...updates, front: args.front.trim(), back: args.back.trim(), updatedAt: Date.now() });
    return true;
  },
});

export const toggleSuspendCard = mutation({
  args: { cardId: v.id("flashcards"), suspended: v.boolean() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await assertCardAccess(ctx, args.cardId, user._id);
    await ctx.db.patch(args.cardId, { suspended: args.suspended, updatedAt: Date.now() });
    return true;
  },
});

export const deleteFlashcard = mutation({
  args: { cardId: v.id("flashcards"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const card = await assertCardAccess(ctx, args.cardId, user._id);
    await ctx.db.delete(args.cardId);
    const deck = (await ctx.db.get(card.deckId)) as Doc<"flashcardDecks"> | null;
    if (deck) await ctx.db.patch(deck._id, { totalCards: Math.max(0, deck.totalCards - 1), masteredCards: Math.max(0, deck.masteredCards - (card.isMastered ? 1 : 0)), updatedAt: Date.now() });
    return true;
  },
});

export const getStudyQueue = query({
  args: { deckId: v.optional(v.id("flashcardDecks")), courseId: v.optional(v.id("courses")), mode: v.union(v.literal("due"), v.literal("all"), v.literal("learning"), v.literal("cram")), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    return await buildQueue(ctx, user._id, args);
  },
});

export const getCardsDueForReview = query({
  args: { deckId: v.id("flashcardDecks"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await assertDeckAccess(ctx, args.deckId, user._id);
    return await buildQueue(ctx, user._id, { deckId: args.deckId, mode: "due", limit: 200 });
  },
});

export const getDeck = query({
  args: { deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const deck = await assertDeckAccess(ctx, args.deckId, user._id);
    const creator = await ctx.db.get(deck.createdBy);
    const course = deck.courseId ? await ctx.db.get(deck.courseId) : null;
    return { ...deck, creator, course };
  },
});

export const getFlashcard = query({
  args: { cardId: v.id("flashcards") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    return await assertCardAccess(ctx, args.cardId, user._id);
  },
});

export const createStudySession = mutation({
  args: { deckId: v.optional(v.id("flashcardDecks")), courseId: v.optional(v.id("courses")), mode: v.union(v.literal("due"), v.literal("all"), v.literal("learning"), v.literal("cram")), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!args.deckId && !args.courseId) throw new ConvexError("Choose a deck or course first");
    if (args.deckId) await assertDeckAccess(ctx, args.deckId, user._id);
    const cardIds = await buildQueue(ctx, user._id, args);
    if (!cardIds.length) throw new ConvexError("There are no cards ready for this session.");
    return await ctx.db.insert("studySessions", { userId: user._id, deckId: args.deckId, courseId: args.courseId, mode: args.mode, cardIds: cardIds.map((card: any) => card._id), cardsStudied: 0, correctAnswers: 0, incorrectAnswers: 0, accuracy: 0, duration: 0, againCount: 0, hardCount: 0, goodCount: 0, easyCount: 0, sessionType: args.mode === "due" ? "due" : args.mode === "cram" ? "cram" : args.mode === "learning" ? "learning" : "all", createdAt: Date.now() });
  },
});

export const startStudySession = mutation({
  args: { userId: v.id("users"), deckId: v.id("flashcardDecks"), sessionType: v.union(v.literal("all"), v.literal("unmastered"), v.literal("review"), v.literal("due"), v.literal("learning"), v.literal("cram")) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await assertDeckAccess(ctx, args.deckId, user._id);
    return await ctx.db.insert("studySessions", { userId: user._id, deckId: args.deckId, cardsStudied: 0, correctAnswers: 0, incorrectAnswers: 0, accuracy: 0, duration: 0, sessionType: args.sessionType, createdAt: Date.now() });
  },
});

export const getStudySession = query({
  args: { sessionId: v.id("studySessions") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) throw new ConvexError("Session not found");
    return session;
  },
});

async function applyReview(ctx: any, cardId: Id<"flashcards">, rating: Rating, sessionId?: Id<"studySessions">, responseTimeMs?: number) {
  const user = await getAuthenticatedUser(ctx);
  const card = await assertCardAccess(ctx, cardId, user._id);
  const now = Date.now();
  if (sessionId) {
    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== user._id) throw new ConvexError("Session not found");
  }
  const next = scheduleCard(card, rating, now);
  const oldMastered = Boolean(card.isMastered);
  const newMastered = next.isMastered;
  const updates: any = { ...next, confidence: rating === "again" ? undefined : rating, timesCorrect: (card.timesCorrect ?? 0) + (rating === "again" ? 0 : 1), timesIncorrect: (card.timesIncorrect ?? 0) + (rating === "again" ? 1 : 0), lastStudied: now, updatedAt: now };
  await ctx.db.patch(cardId, updates);
  if (oldMastered !== newMastered) {
    const deck = await ctx.db.get(card.deckId);
    if (deck) await ctx.db.patch(deck._id, { masteredCards: Math.max(0, deck.masteredCards + (newMastered ? 1 : -1)), updatedAt: now });
  }
  await ctx.db.insert("flashcardReviews", { userId: user._id, deckId: card.deckId, cardId, rating, reviewedAt: now, previousDue: card.due ?? card.nextReviewDate, nextDue: next.due, previousState: next.previousState, newState: next.state, responseTimeMs, scheduledDays: next.scheduledDays });
  if (sessionId) {
    const session = await ctx.db.get(sessionId);
    if (session) await ctx.db.patch(sessionId, { cardsStudied: session.cardsStudied + 1, correctAnswers: session.correctAnswers + (rating === "again" ? 0 : 1), incorrectAnswers: session.incorrectAnswers + (rating === "again" ? 1 : 0), againCount: (session.againCount ?? 0) + (rating === "again" ? 1 : 0), hardCount: (session.hardCount ?? 0) + (rating === "hard" ? 1 : 0), goodCount: (session.goodCount ?? 0) + (rating === "good" ? 1 : 0), easyCount: (session.easyCount ?? 0) + (rating === "easy" ? 1 : 0), accuracy: ((session.correctAnswers + (rating === "again" ? 0 : 1)) / (session.cardsStudied + 1)) * 100 });
  }
  return { ...card, ...updates };
}

export const reviewCard = mutation({
  args: { cardId: v.id("flashcards"), rating: v.union(v.literal("again"), v.literal("hard"), v.literal("good"), v.literal("easy")), sessionId: v.optional(v.id("studySessions")), responseTimeMs: v.optional(v.number()) },
  handler: async (ctx, args) => applyReview(ctx, args.cardId, args.rating, args.sessionId, args.responseTimeMs),
});

export const updateCardPerformance = mutation({
  args: { cardId: v.id("flashcards"), isCorrect: v.optional(v.boolean()), confidence: v.optional(v.union(v.literal("hard"), v.literal("good"), v.literal("easy"))) },
  handler: async (ctx, args) => applyReview(ctx, args.cardId, args.confidence ? args.confidence : args.isCorrect ? "good" : "again"),
});

export const endStudySession = mutation({
  args: { sessionId: v.id("studySessions"), cardsStudied: v.number(), correctAnswers: v.number(), incorrectAnswers: v.number(), duration: v.number() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) throw new ConvexError("Session not found");
    await ctx.db.patch(args.sessionId, { cardsStudied: args.cardsStudied, correctAnswers: args.correctAnswers, incorrectAnswers: args.incorrectAnswers, accuracy: args.cardsStudied ? (args.correctAnswers / args.cardsStudied) * 100 : 0, duration: args.duration, completedAt: Date.now() });
    return true;
  },
});

export const getUserStudyStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    const sessions = await ctx.db.query("studySessions").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    const totalCardsStudied = sessions.reduce((sum, session) => sum + session.cardsStudied, 0);
    const totalCorrect = sessions.reduce((sum, session) => sum + session.correctAnswers, 0);
    return { totalSessions: sessions.length, totalCardsStudied, totalCorrect, totalStudyTime: sessions.reduce((sum, session) => sum + session.duration, 0), averageAccuracy: totalCardsStudied ? (totalCorrect / totalCardsStudied) * 100 : 0 };
  },
});

export const deleteDeck = mutation({
  args: { deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await assertDeckAccess(ctx, args.deckId, user._id);
    const cards = await ctx.db.query("flashcards").withIndex("by_deckId", (q) => q.eq("deckId", args.deckId)).collect();
    for (const card of cards) await ctx.db.delete(card._id);
    const reviews = await ctx.db.query("flashcardReviews").withIndex("by_deck_reviewedAt", (q) => q.eq("deckId", args.deckId)).collect();
    for (const review of reviews) await ctx.db.delete(review._id);
    await ctx.db.delete(args.deckId);
    return true;
  },
});

export const getPublicDecks = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("flashcardDecks").withIndex("by_public", (q) => q.eq("isPublic", true)).collect(),
});
