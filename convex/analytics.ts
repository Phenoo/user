import { v } from "convex/values";
import { query } from "./_generated/server";

export const getAnalyticsSummary = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId } = args;

    // 1. Fetch user's pomodoro sessions and study sessions
    const pomodoroSessions = await ctx.db
      .query("pomodoroSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const studySessions = await ctx.db
      .query("studySessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // 2. Fetch user's flashcards & decks
    const flashcards = await ctx.db
      .query("flashcards")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const decks = await ctx.db
      .query("flashcardDecks")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();

    const courses = await ctx.db
      .query("courses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Time calculations
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const SEVEN_DAYS = 7 * ONE_DAY;

    const startOfThisWeek = now - SEVEN_DAYS;
    const startOfLastWeek = now - 2 * SEVEN_DAYS;

    // Pomodoros + Study Sessions this week vs last week
    const thisWeekPomodoroMin = pomodoroSessions
      .filter((s) => s.type === "pomodoro" && s.completedAt >= startOfThisWeek)
      .reduce((acc, s) => acc + s.duration, 0);

    const thisWeekStudyMin = studySessions
      .filter((s) => s.createdAt >= startOfThisWeek)
      .reduce((acc, s) => acc + s.duration, 0);

    const lastWeekPomodoroMin = pomodoroSessions
      .filter(
        (s) =>
          s.type === "pomodoro" &&
          s.completedAt >= startOfLastWeek &&
          s.completedAt < startOfThisWeek
      )
      .reduce((acc, s) => acc + s.duration, 0);

    const lastWeekStudyMin = studySessions
      .filter(
        (s) => s.createdAt >= startOfLastWeek && s.createdAt < startOfThisWeek
      )
      .reduce((acc, s) => acc + s.duration, 0);

    const thisWeekMinutes = thisWeekPomodoroMin + thisWeekStudyMin;
    const lastWeekMinutes = lastWeekPomodoroMin + lastWeekStudyMin;

    const studyTimeHours = Math.round((thisWeekMinutes / 60) * 10) / 10;
    const lastWeekHours = lastWeekMinutes / 60;

    let studyTimeChange = 0;
    if (lastWeekHours > 0) {
      studyTimeChange = Math.round(
        ((studyTimeHours - lastWeekHours) / lastWeekHours) * 100
      );
    } else if (studyTimeHours > 0) {
      studyTimeChange = 100;
    }

    // Flashcard & Study Session accuracy stats
    let totalCorrect = 0;
    let totalAttempts = 0;
    let masteredCount = 0;
    let masteredThisWeek = 0;

    flashcards.forEach((card) => {
      totalCorrect += card.timesCorrect || 0;
      totalAttempts += (card.timesCorrect || 0) + (card.timesIncorrect || 0);

      if (card.isMastered) {
        masteredCount++;
        if (card.masteredAt && card.masteredAt >= startOfThisWeek) {
          masteredThisWeek++;
        }
      }
    });

    studySessions.forEach((sess) => {
      totalCorrect += sess.correctAnswers || 0;
      totalAttempts += (sess.correctAnswers || 0) + (sess.incorrectAnswers || 0);
    });

    const accuracyRate =
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    // Calculate Streak (consecutive days with activity)
    const activeDates = new Set<string>();
    pomodoroSessions.forEach((s) => {
      if (s.type === "pomodoro") {
        activeDates.add(new Date(s.completedAt).toISOString().split("T")[0]);
      }
    });
    studySessions.forEach((s) => {
      activeDates.add(new Date(s.createdAt).toISOString().split("T")[0]);
    });
    flashcards.forEach((card) => {
      if (card.lastStudied) {
        activeDates.add(new Date(card.lastStudied).toISOString().split("T")[0]);
      }
    });

    let streakDays = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (activeDates.has(dateStr)) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has no activity yet, check yesterday before stopping
        if (streakDays === 0) {
          const yesterday = new Date(now - ONE_DAY).toISOString().split("T")[0];
          if (activeDates.has(yesterday)) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    // Daily Performance for last 7 days
    const daysName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyPerformance = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * ONE_DAY);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = daysName[d.getDay()];

      const dayPomodoros = pomodoroSessions.filter(
        (s) =>
          s.type === "pomodoro" &&
          new Date(s.completedAt).toISOString().split("T")[0] === dateStr
      );
      const dayStudySessions = studySessions.filter(
        (s) => new Date(s.createdAt).toISOString().split("T")[0] === dateStr
      );

      const pomodoroMin = dayPomodoros.reduce((acc, s) => acc + s.duration, 0);
      const studyMin = dayStudySessions.reduce((acc, s) => acc + s.duration, 0);

      const dayHours = Math.round(((pomodoroMin + studyMin) / 60) * 10) / 10;

      dailyPerformance.push({
        date: dateStr,
        day: dayName,
        hours: dayHours,
        sessionsCount: dayPomodoros.length + dayStudySessions.length,
      });
    }

    // Subject Performance
    const subjectColors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];

    const subjectPerformance = courses.map((course, idx) => {
      const courseDecks = decks.filter((deck) => deck.courseId === course._id);
      const courseDeckIds = new Set(courseDecks.map((d) => d._id));

      const courseCards = flashcards.filter((card) =>
        courseDeckIds.has(card.deckId)
      );

      const courseStudySessions = studySessions.filter(
        (s) => !!s.deckId && courseDeckIds.has(s.deckId)
      );

      let courseCorrect = 0;
      let courseAttempts = 0;
      let courseMastered = 0;

      courseCards.forEach((c) => {
        courseCorrect += c.timesCorrect || 0;
        courseAttempts += (c.timesCorrect || 0) + (c.timesIncorrect || 0);
        if (c.isMastered) courseMastered++;
      });

      courseStudySessions.forEach((s) => {
        courseCorrect += s.correctAnswers || 0;
        courseAttempts += (s.correctAnswers || 0) + (s.incorrectAnswers || 0);
      });

      const courseAccuracy =
        courseAttempts > 0
          ? Math.round((courseCorrect / courseAttempts) * 100)
          : 0;

      return {
        courseId: course._id,
        subject: course.name,
        code: course.code,
        accuracy: courseAccuracy,
        cardsMastered: courseMastered,
        totalCards: courseCards.length,
        color: subjectColors[idx % subjectColors.length],
      };
    });

    return {
      studyTimeHours,
      studyTimeChange,
      accuracyRate,
      cardsMastered: masteredCount,
      cardsMasteredThisWeek: masteredThisWeek,
      streakDays,
      dailyPerformance,
      subjectPerformance,
    };
  },
});
