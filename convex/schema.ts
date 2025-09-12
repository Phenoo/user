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
    stripeCustomerId: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
    endsOn: v.optional(v.number()),
    subscriptionId: v.optional(v.string()),
    subscriptionPlan: v.optional(
      v.union(
        v.literal("FREE"),
        v.literal("STUDENT"),
        v.literal("STUDENTPRO"),
        v.literal("STUDENTPRO_YEAR"),
        v.literal("STUDENT_YEAR")
      )
    ),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("canceled"),
        v.literal("incomplete"),
        v.literal("incomplete_expired"),
        v.literal("past_due"),
        v.literal("trialing"),
        v.literal("unpaid")
      )
    ),
    subscriptionCancelAtPeriodEnd: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("by_name", ["name"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_subscriptionId", ["subscriptionId"])
    .index("by_school", ["school"])
    .index("by_location", ["location"]),
  subscriptionEvents: defineTable({
    userId: v.id("users"),
    stripeEventId: v.string(),
    eventType: v.string(),
    subscriptionId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    processed: v.boolean(),
    data: v.any(), // Store the full Stripe event data
    createdAt: v.number(),
  })
    .index("by_stripe_event", ["stripeEventId"])
    .index("by_user", ["userId"]),
  courses: defineTable({
    userId: v.id("users"), // Link to the user who owns this course
    name: v.string(), // e.g., "Introduction to Programming"
    code: v.string(), // e.g., "CS101"
    academicYear: v.string(), // e.g., "2024-2025"
    session: v.string(), // e.g., "Fall", "Spring", "Summer"
    instructor: v.string(), // e.g., "Prof. J. Smith"
    credits: v.number(),
    description: v.optional(v.string()),
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
    .index("by_userId_session", ["userId", "session"])
    .index("by_userId_academicYear_session_code", [
      "userId",
      "academicYear",
      "session",
      "code",
    ])
    .index("by_userId_academicYear_session_name", [
      "userId",
      "academicYear",
      "session",
      "name",
    ]),

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
    name: v.string(),
    courseId: v.id("courses"),
    description: v.string(),
    organizerId: v.id("users"),
    maxMembers: v.number(),
    currentMembers: v.number(),
    meetingType: v.union(
      v.literal("In-Person"),
      v.literal("Online"),
      v.literal("Hybrid")
    ),
    location: v.string(),
    meetingSchedule: v.string(),
    googleCalendarLink: v.optional(v.string()),
    zoomLink: v.optional(v.string()),
    tags: v.array(v.string()),
    rating: v.number(),
    ratingCount: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_organizer", ["organizerId"]),

  // Study Group Memberships
  studyGroupMembers: defineTable({
    studyGroupId: v.id("studyGroups"),
    userId: v.id("users"),
    role: v.union(v.literal("organizer"), v.literal("member")),
    joinedAt: v.number(),
    contributions: v.number(),
    isActive: v.boolean(),
  })
    .index("by_group", ["studyGroupId"])
    .index("by_user", ["userId"])
    .index("by_group_user", ["studyGroupId", "userId"]),

  // Study Group Messages
  studyGroupMessages: defineTable({
    studyGroupId: v.id("studyGroups"),
    userId: v.id("users"),
    message: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("file"),
      v.literal("link")
    ),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_group", ["studyGroupId"])
    .index("by_group_time", ["studyGroupId", "createdAt"]),

  // Study Group Resources
  studyGroupResources: defineTable({
    studyGroupId: v.id("studyGroups"),
    uploadedBy: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("pdf"),
      v.literal("doc"),
      v.literal("link"),
      v.literal("video")
    ),
    url: v.string(),
    size: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_group", ["studyGroupId"]),
  // --- Flashcards and Flashcard Decks Collection ---

  flashcardDecks: defineTable({
    name: v.string(),
    description: v.string(),
    courseId: v.optional(v.id("courses")),
    createdBy: v.id("users"),
    subject: v.string(),
    difficulty: v.optional(
      v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard"))
    ),
    totalCards: v.number(),
    masteredCards: v.number(),
    color: v.string(),
    isPublic: v.boolean(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["createdBy"])
    .index("by_courseId", ["courseId"])
    .index("by_public", ["isPublic"]),

  flashcards: defineTable({
    userId: v.id("users"),
    deckId: v.id("flashcardDecks"),
    front: v.string(),
    back: v.string(),
    difficulty: v.union(
      v.literal("Easy"),
      v.literal("Medium"),
      v.literal("Hard")
    ),
    timesCorrect: v.number(),
    timesIncorrect: v.number(),
    lastStudied: v.optional(v.number()),
    isMastered: v.boolean(),
    masteredAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_deckId", ["deckId"])
    .index("by_userId_deckId", ["userId", "deckId"]),

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
  studyGroupInvites: defineTable({
    studyGroupId: v.id("studyGroups"),
    inviteCode: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    usedCount: v.number(),
    maxUses: v.number(),
  })
    .index("by_group", ["studyGroupId"])
    .index("by_code", ["inviteCode"]),

  studySessions: defineTable({
    userId: v.id("users"),
    deckId: v.id("flashcardDecks"),
    cardsStudied: v.number(),
    correctAnswers: v.number(),
    incorrectAnswers: v.number(),
    accuracy: v.number(),
    duration: v.number(), // in minutes
    sessionType: v.union(
      v.literal("all"),
      v.literal("unmastered"),
      v.literal("review")
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_deck", ["deckId"])
    .index("by_user_date", ["userId", "createdAt"]),
});

export default schema;
