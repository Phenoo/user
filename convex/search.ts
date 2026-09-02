import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { auth } from "./auth";

type SearchResult = {
  id: string;
  type: "course" | "task" | "assignment" | "document" | "deck" | "flashcard";
  title: string;
  subtitle: string;
  href: string;
  score: number;
};

function scoreMatch(queryText: string, fields: Array<string | undefined>) {
  let score = 0;
  for (const field of fields) {
    const value = field?.toLowerCase();
    if (!value) continue;
    if (value === queryText) score = Math.max(score, 100);
    else if (value.startsWith(queryText)) score = Math.max(score, 75);
    else if (value.includes(queryText)) score = Math.max(score, 50);
  }
  return score;
}

export const global = query({
  args: { search: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const search = args.search.trim().toLowerCase();
    if (search.length < 2) return [];
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 50);
    const userIdString = userId as string;

    const [courses, tasks, assignments, documents, decks, cards] =
      await Promise.all([
        ctx.db.query("courses").withIndex("by_userId", (q) => q.eq("userId", userId)).take(150),
        ctx.db.query("tasks").withIndex("by_user", (q) => q.eq("userId", userId)).take(150),
        ctx.db.query("assignments").withIndex("by_user", (q) => q.eq("userId", userIdString)).take(150),
        ctx.db.query("courseDocuments").withIndex("by_user", (q) => q.eq("userId", userId)).take(150),
        ctx.db.query("flashcardDecks").withIndex("by_creator", (q) => q.eq("createdBy", userId)).take(150),
        ctx.db.query("flashcards").withIndex("by_userId", (q) => q.eq("userId", userId)).take(150),
      ]);

    const results: SearchResult[] = [];
    const add = (result: SearchResult) => {
      if (result.score > 0) results.push(result);
    };

    for (const course of courses) {
      add({
        id: course._id,
        type: "course",
        title: course.name,
        subtitle: [course.code, course.instructor].filter(Boolean).join(" · "),
        href: `/dashboard/courses/course/${course._id}`,
        score: scoreMatch(search, [course.name, course.code, course.description, course.instructor]),
      });
    }
    for (const task of tasks) {
      add({
        id: task._id,
        type: "task",
        title: task.title,
        subtitle: [task.category, task.status].filter(Boolean).join(" · "),
        href: "/dashboard/tasks",
        score: scoreMatch(search, [task.title, task.description, task.category]),
      });
    }
    for (const assignment of assignments) {
      add({
        id: assignment._id,
        type: "assignment",
        title: assignment.title,
        subtitle: [assignment.subject, assignment.dueDate ? `Due ${assignment.dueDate}` : undefined]
          .filter(Boolean)
          .join(" · "),
        href: "/dashboard/tasks",
        score: scoreMatch(search, [assignment.title, assignment.description, assignment.subject]),
      });
    }
    for (const document of documents) {
      add({
        id: document._id,
        type: "document",
        title: document.title,
        subtitle: [document.fileName, document.processingStatus].filter(Boolean).join(" · "),
        href: `/dashboard/courses/course/${document.courseId}`,
        score: scoreMatch(search, [document.title, document.fileName, document.textContent?.slice(0, 2_000)]),
      });
    }
    for (const deck of decks) {
      add({
        id: deck._id,
        type: "deck",
        title: deck.name,
        subtitle: [deck.subject, `${deck.totalCards} cards`].filter(Boolean).join(" · "),
        href: `/dashboard/flashcards/${deck._id}`,
        score: scoreMatch(search, [deck.name, deck.description, deck.subject, deck.tags.join(" ")]),
      });
    }
    for (const card of cards) {
      add({
        id: card._id,
        type: "flashcard",
        title: card.front,
        subtitle: card.back.slice(0, 100),
        href: `/dashboard/flashcards/${card.deckId}`,
        score: scoreMatch(search, [card.front, card.back, card.tags?.join(" ")]),
      });
    }

    return results
      .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
      .slice(0, limit);
  },
});
