import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    isOnboarding: v.optional(v.boolean()),
    school: v.optional(v.string()),
    course: v.optional(v.string()),
    year: v.optional(v.string()),
    major: v.optional(v.string()),
    location: v.optional(v.string()),
    challenges: v.optional(v.array(v.string())),
    shortTermGoal: v.optional(v.string()),
    longTermGoal: v.optional(v.string()),
    reminderPreference: v.optional(v.string()),
    studyTime: v.optional(v.string()),
    schoolEmail: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("by_name", ["name"])
    .index("by_school", ["school"])
    .index("by_location", ["location"]),
  courses: defineTable({
    userId: v.id("users"), // Link to the user who owns this course
    name: v.string(), // e.g., "Introduction to Programming"
    code: v.string(), // e.g., "CS101"
    academicYear: v.string(), // e.g., "2024-2025"
    session: v.string(), // e.g., "Fall", "Spring", "Summer"
    professor: v.string(), // e.g., "Prof. J. Smith"
    credits: v.number(),
    description: v.optional(v.string()),
    startDate: v.number(), // Unix timestamp for start date
    endDate: v.number(), // Unix timestamp for end date
    lmsLink: v.optional(v.string()), // Learning Management System link
    colorTag: v.optional(v.string()), // Hex color or predefined color name for visual ID
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("dropped")
    ), // Course status
  })
    .index("by_userId", ["userId"])
    .index("by_userId_academicYear", ["userId", "academicYear"])
    .index("by_userId_session", ["userId", "session"]),

  // --- Schedules Collection (Course-specific schedule items) ---
  schedules: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"), // Link to the course this schedule item belongs to
    type: v.union(
      v.literal("lecture"),
      v.literal("lab"),
      v.literal("discussion"),
      v.literal("office_hours"),
      v.literal("other")
    ),
    dayOfWeek: v.union(
      // For recurring schedules
      v.literal("Monday"),
      v.literal("Tuesday"),
      v.literal("Wednesday"),
      v.literal("Thursday"),
      v.literal("Friday"),
      v.literal("Saturday"),
      v.literal("Sunday")
    ),
    startTime: v.string(), // e.g., "10:00 AM" or "10:00" (consider a consistent format like "HH:mm")
    endTime: v.string(), // e.g., "11:00 AM" or "11:00"
    location: v.optional(v.string()), // e.g., "Room 101, Main Hall" or "Zoom Link"
    instructor: v.optional(v.string()), // Specific instructor if different from course professor
    notes: v.optional(v.string()),
  })
    .index("by_courseId", ["courseId"])
    .index("by_userId_courseId", ["userId", "courseId"])
    .index("by_userId_dayOfWeek", ["userId", "dayOfWeek"]), // For full calendar view

  // --- Study Groups Collection ---
  studyGroups: defineTable({
    userId: v.id("users"), // The user who created the group
    courseId: v.id("courses"), // The course this study group is for
    name: v.string(), // e.g., "Python Basics Group"
    description: v.optional(v.string()),
    members: v.array(v.id("users")), // Array of user IDs who are members
    schedule: v.optional(
      v.object({
        // Optional recurring schedule for the group
        dayOfWeek: v.union(
          v.literal("Monday"),
          v.literal("Tuesday"),
          v.literal("Wednesday"),
          v.literal("Thursday"),
          v.literal("Friday"),
          v.literal("Saturday"),
          v.literal("Sunday")
        ),
        time: v.string(), // e.g., "19:00"
        frequency: v.optional(
          v.union(
            v.literal("weekly"),
            v.literal("bi-weekly"),
            v.literal("ad-hoc")
          )
        ),
      })
    ),
    meetingLink: v.optional(v.string()), // Zoom, Google Meet link
    status: v.union(v.literal("active"), v.literal("archived")),
  })
    .index("by_courseId", ["courseId"])
    .index("by_userId", ["userId"]) // For finding groups created by a user
    .index("by_member_userId", ["members"]), // For finding groups a user is part of

  // --- Flashcards and Flashcard Decks Collection ---
  flashcardDecks: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"), // Link to the course this deck is for
    name: v.string(), // e.g., "Module 1: Basic Syntax"
    description: v.optional(v.string()),
    tags: v.array(v.string()), // e.g., ["Python", "Variables", "Functions"]
    lastReviewed: v.optional(v.number()), // Unix timestamp
  })
    .index("by_courseId", ["courseId"])
    .index("by_userId", ["userId"]),

  flashcards: defineTable({
    userId: v.id("users"),
    deckId: v.id("flashcardDecks"),
    question: v.string(),
    answer: v.string(),
    difficulty: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))
    ),
    lastReviewed: v.optional(v.number()), // Unix timestamp
    nextReview: v.optional(v.number()), // Unix timestamp for next review
    correctCount: v.optional(v.number()),
    incorrectCount: v.optional(v.number()),
  })
    .index("by_deckId", ["deckId"])
    .index("by_userId_deckId", ["userId", "deckId"]),
  // But if you need to store specific user-course progress not derivable from other tables:
  courseProgress: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    progressPercentage: v.number(), // 0-100
    lastUpdated: v.number(), // Unix timestamp
    grade: v.optional(v.string()), // e.g., "A", "B+", "Pass"
    // Could store specific assignment/quiz scores here too, or in a separate collection
  })
    .index("by_userId_courseId", ["userId", "courseId"])
    .index("by_courseId", ["courseId"]), // To get all progress for a course (e.g., if multiple users in a shared context)

  // Example for a general calendar event (e.g., for dashboard)
  calendarEvents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    start: v.number(), // Unix timestamp
    end: v.number(), // Unix timestamp
    allDay: v.boolean(),
    courseId: v.optional(v.id("courses")), // Link to a course if related
    type: v.union(
      v.literal("assignment"),
      v.literal("exam"),
      v.literal("meeting"),
      v.literal("custom"),
      v.literal("schedule_item")
    ), // differentiate event types
  })
    .index("by_userId", ["userId"])
    .index("by_userId_start", ["userId", "start"]),
});

export default schema;
