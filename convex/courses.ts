import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

import { Doc, Id } from "./_generated/dataModel"; // Import Doc and Id types

async function getUserId(ctx: any): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const userId = identity.subject; // This is the Clerk User ID

  const existingUser = await ctx.db.get(userId);

  return existingUser._id;
}

// --- Course Queries ---
// Function to get all courses for the logged-in user, grouped by academic year.
export const getCoursesByYear = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = await getUserId(ctx);
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Group courses by academic year
    const groupedCourses: Record<string, Doc<"courses">[]> = {};
    courses.forEach((course) => {
      if (!groupedCourses[course.academicYear]) {
        groupedCourses[course.academicYear] = [];
      }
      groupedCourses[course.academicYear].push(course);
    });

    // Sort years in descending order (most recent first)
    const sortedYears = Object.keys(groupedCourses).sort().reverse();

    // Return an array of objects for easier iteration in frontend
    return sortedYears.map((year) => ({
      year: year,
      courses: groupedCourses[year].sort((a, b) =>
        a.name.localeCompare(b.name)
      ), // Sort courses alphabetically within each year
    }));
  },
});

export const getAllCourses = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("courses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getCourseById = query({
  args: { courseId: v.id("courses"), currentuserId: v.id("users") },
  handler: async (ctx, { courseId, currentuserId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(courseId);

    if (!course || course.userId !== currentuserId) {
      return null; // Or throw an error for unauthorized access
    }

    return course;
  },
});

// --- Course Mutations ---

// 1. Add Course
export const addCourse = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    code: v.string(),
    academicYear: v.string(),
    session: v.string(),
    instructor: v.string(),
    credits: v.number(),
    description: v.optional(v.string()),
    lmsLink: v.optional(v.string()),
    colorTag: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("dropped")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingUser = await ctx.db.get(args.userId);

    const userId = existingUser?._id!;

    const { name, code, academicYear, session } = args;

    const existingCourseByCode = await ctx.db
      .query("courses")
      .withIndex("by_userId_academicYear_session_code", (q) =>
        q
          .eq("userId", userId)
          .eq("academicYear", academicYear)
          .eq("session", session)
          .eq("code", code)
      )
      .unique();

    if (existingCourseByCode) {
      throw new Error(
        `A course with code "${code}" already exists for ${academicYear} ${session}.`
      );
    }

    const existingCourseByName = await ctx.db
      .query("courses")
      .withIndex("by_userId_academicYear_session_name", (q) =>
        q
          .eq("userId", userId)
          .eq("academicYear", academicYear)
          .eq("session", session)
          .eq("name", name)
      )
      .unique();

    if (existingCourseByName) {
      throw new Error(
        `A course with name "${name}" already exists for ${academicYear} ${session}.`
      );
    }

    const courseId = await ctx.db.insert("courses", {
      ...args, // Spread all the provided arguments
    });

    return courseId; // Return the ID of the newly created course
  },
});

// 2. Edit Course
export const editCourse = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"), // The ID of the course to edit
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    academicYear: v.optional(v.string()),
    session: v.optional(v.string()),
    instructor: v.optional(v.string()),
    credits: v.optional(v.number()),
    description: v.optional(v.string()),
    lmsLink: v.optional(v.string()),
    colorTag: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("active"), v.literal("completed"), v.literal("dropped"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { userId, courseId, ...updates } = args;

    // First, verify that the course exists and belongs to the authenticated user
    const existingCourse = await ctx.db.get(courseId);
    if (!existingCourse || existingCourse.userId !== userId) {
      throw new Error("Course not found or unauthorized access");
    }

    // Perform the update
    await ctx.db.patch(courseId, updates);

    return true; // Indicate success
  },
});

// 3. Delete Course
export const deleteCourse = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"), // The ID of the course to delete
  },
  handler: async (ctx, { userId, courseId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // First, verify that the course exists and belongs to the authenticated user
    const existingCourse = await ctx.db.get(courseId);
    if (!existingCourse || existingCourse.userId !== userId) {
      throw new Error("Course not found or unauthorized access");
    }

    // IMPORTANT: When deleting a course, you likely want to delete all
    // associated data (schedules, study groups, flashcard decks/flashcards, course progress).
    // This is called "cascading delete".

    // Delete associated schedules
    const associatedSchedules = await ctx.db
      .query("schedules")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();
    await Promise.all(associatedSchedules.map((s) => ctx.db.delete(s._id)));

    // Delete associated study groups
    const associatedStudyGroups = await ctx.db
      .query("studyGroups")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();
    await Promise.all(associatedStudyGroups.map((sg) => ctx.db.delete(sg._id)));

    // Delete associated flashcard decks and their flashcards
    const associatedFlashcardDecks = await ctx.db
      .query("flashcardDecks")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    await Promise.all(
      associatedFlashcardDecks.map(async (deck) => {
        const associatedFlashcards = await ctx.db
          .query("flashcards")
          .withIndex("by_deckId", (q) => q.eq("deckId", deck._id))
          .collect();
        await Promise.all(
          associatedFlashcards.map((fc) => ctx.db.delete(fc._id))
        );
        await ctx.db.delete(deck._id); // Delete the deck itself
      })
    );

    // Delete associated course progress
    const associatedCourseProgress = await ctx.db
      .query("courseProgress")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();
    await Promise.all(
      associatedCourseProgress.map((cp) => ctx.db.delete(cp._id))
    );

    // Finally, delete the course itself
    await ctx.db.delete(courseId);

    return true; // Indicate success
  },
});
