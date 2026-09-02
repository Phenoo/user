import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.string(),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    birthDate: v.optional(v.string()),
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
    endsOn: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    subscriptionPlan: v.optional(
      v.union(v.literal("FREE"), v.literal("STUDENT"), v.literal("STUDENTPRO"))
    ),
    subscriptionTier: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    subscriptionCancelAtPeriodEnd: v.optional(v.boolean()),
  })
    .index("by_name", ["name"])
    .index("email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_subscriptionId", ["subscriptionId"])
    .index("by_school", ["school"])
    .index("by_location", ["location"]),
  subscriptions: defineTable({
    userId: v.id("users"),
    polarSubscriptionId: v.string(),
    polarCustomerId: v.string(),
    productId: v.string(),
    productName: v.string(),
    priceId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("incomplete"),
      v.literal("incomplete_expired"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("unpaid")
    ),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    canceledAt: v.optional(v.number()),
    trialStart: v.optional(v.number()),
    trialEnd: v.optional(v.number()),
    previousProductId: v.optional(v.string()),
    previousPriceId: v.optional(v.string()),
    lastPlanChangeAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_polar_subscription", ["polarSubscriptionId"]),

  products: defineTable({
    polarProductId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    prices: v.array(
      v.object({
        id: v.string(),
        amount: v.number(),
        currency: v.string(),
        interval: v.union(v.literal("month"), v.literal("year")),
        intervalCount: v.number(),
      })
    ),
    features: v.array(v.string()),
    isActive: v.boolean(),
  }).index("by_polar_product", ["polarProductId"]),

  invoices: defineTable({
    userId: v.id("users"),
    subscriptionId: v.string(),
    polarInvoiceId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("paid"),
      v.literal("uncollectible"),
      v.literal("void")
    ),
    invoiceDate: v.number(),
    paidAt: v.optional(v.number()),
    invoiceUrl: v.optional(v.string()),
  })
    .index("by_polar_invoice", ["polarInvoiceId"])
    .index("by_user", ["userId"])
    .index("by_subscription", ["subscriptionId"]),
  connectedAccounts: defineTable({
    userId: v.id("users"),
    provider: v.union(
      v.literal("google-calendar"),
      v.literal("google-drive"),
      v.literal("google-classroom"),
      v.literal("canvas"),
      v.literal("microsoft-education"),
      v.literal("onedrive")
    ),
    externalAccountId: v.optional(v.string()),
    email: v.optional(v.string()),
    scopes: v.array(v.string()),
    status: v.union(
      v.literal("connected"),
      v.literal("needs_reauth"),
      v.literal("disconnected")
    ),
    refreshToken: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    connectedAt: v.number(),
    lastSyncAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_user_provider", ["userId", "provider"]),

  googleCredentials: defineTable({
    userId: v.id("users"),
    encryptedCredentials: v.string(),
    scopes: v.array(v.string()),
    email: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  integrationSyncs: defineTable({
    userId: v.id("users"),
    provider: v.union(
      v.literal("google-calendar"),
      v.literal("google-drive"),
      v.literal("google-classroom"),
      v.literal("canvas"),
      v.literal("microsoft-education"),
      v.literal("onedrive")
    ),
    type: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("success"),
      v.literal("failed")
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    importedCount: v.optional(v.number()),
    updatedCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
    error: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_user_provider", ["userId", "provider"])
    .index("by_user_started", ["userId", "startedAt"]),
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
    source: v.optional(v.union(v.literal("manual"), v.literal("google-classroom"))),
    externalId: v.optional(v.string()),
    externalUpdatedAt: v.optional(v.string()),
    colorTag: v.optional(v.string()), // Hex color or predefined color name for visual ID
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("dropped")
    ), // Course status
  })
    .index("by_userId", ["userId"])
    .index("by_user_source_external", ["userId", "source", "externalId"])
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
  events: defineTable({
    title: v.string(),
    description: v.string(),
    startDate: v.string(), // ISO date
    endDate: v.string(), // ISO date
    color: v.string(),
    userId: v.string(),
    courseId: v.optional(v.id("courses")),
    source: v.optional(v.union(v.literal("manual"), v.literal("google-classroom"))),
    externalId: v.optional(v.string()),
    lmsLink: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_source_external", ["userId", "source", "externalId"]),

  assessments: defineTable({
    courseId: v.id("courses"),
    userId: v.id("users"),
    name: v.string(),
    type: v.string(), // "Exam", "Assignment", "Quiz", "Project", etc.
    score: v.optional(v.number()), // Actual score obtained
    maxScore: v.optional(v.number()), // Maximum possible score
    weight: v.number(), // Weight percentage (e.g., 30 for 30%)
    date: v.string(), // Due date or date of assessment
    feedback: v.optional(v.string()), // Instructor feedback
    status: v.union(
      v.literal("graded"),
      v.literal("pending"),
      v.literal("upcoming")
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_courseId", ["courseId"])
    .index("by_userId_courseId", ["userId", "courseId"]),

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
  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    category: v.string(),
    dueDate: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("done"),
      v.literal("in-progress")
    ),
    completed: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
    comments: v.array(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_completed", ["userId", "completed"])
    .index("by_user_priority", ["userId", "priority"])
    .index("by_user_category", ["userId", "category"]),
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
    isPublic: v.boolean(), // Public groups anyone can join, private groups need invite
    aiModeration: v.optional(v.boolean()), // Enable AI moderation for group chat
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_organizer", ["organizerId"])
    .index("by_public", ["isPublic"]),

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

  // Study Group Invites (for private groups)
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

  // Study Together Sessions (synchronized timer sessions)
  studyTogetherSessions: defineTable({
    studyGroupId: v.id("studyGroups"),
    createdBy: v.id("users"),
    title: v.string(),
    duration: v.number(), // in minutes
    startTime: v.number(),
    endTime: v.number(),
    isActive: v.boolean(),
    participants: v.array(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_group", ["studyGroupId"])
    .index("by_active", ["isActive"]),

  // Shared Content (notes, summaries shared within groups)
  sharedContent: defineTable({
    studyGroupId: v.id("studyGroups"),
    sharedBy: v.id("users"),
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("note"),
      v.literal("summary"),
      v.literal("study_guide")
    ),
    sourceId: v.optional(v.string()), // Reference to original generatedContent if applicable
    isAIGenerated: v.boolean(),
    likes: v.number(),
    createdAt: v.number(),
  })
    .index("by_group", ["studyGroupId"])
    .index("by_user", ["sharedBy"]),

  // Friend Invites (for inviting friends to private groups)
  friendInvites: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    studyGroupId: v.id("studyGroups"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined")
    ),
    createdAt: v.number(),
  })
    .index("by_to_user", ["toUserId"])
    .index("by_group", ["studyGroupId"]),
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
    imageUrl: v.optional(v.string()), // Support for images in flashcards
    cardType: v.optional(
      v.union(v.literal("basic"), v.literal("cloze"), v.literal("basic_reversed"))
    ),
    tags: v.optional(v.array(v.string())),
    explanation: v.optional(v.string()),
    sourceType: v.optional(v.string()),
    sourceId: v.optional(v.string()),
    sourceLabel: v.optional(v.string()),
    confidence: v.optional(
      v.union(v.literal("hard"), v.literal("good"), v.literal("easy"))
    ), // 3-level confidence rating for spaced repetition
    nextReviewDate: v.optional(v.number()), // When card should be reviewed next
    state: v.optional(
      v.union(
        v.literal("new"),
        v.literal("learning"),
        v.literal("review"),
        v.literal("relearning")
      )
    ),
    due: v.optional(v.number()),
    lastReview: v.optional(v.number()),
    stability: v.optional(v.number()),
    memoryDifficulty: v.optional(v.number()),
    reps: v.optional(v.number()),
    lapses: v.optional(v.number()),
    scheduledDays: v.optional(v.number()),
    elapsedDays: v.optional(v.number()),
    suspended: v.optional(v.boolean()),
    buried: v.optional(v.boolean()),
    // Existing fields
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
    .index("by_userId_deckId", ["userId", "deckId"])
    .index("by_nextReview", ["nextReviewDate"]),

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

  studySessions: defineTable({
    userId: v.id("users"),
    deckId: v.optional(v.id("flashcardDecks")),
    courseId: v.optional(v.id("courses")),
    mode: v.optional(
      v.union(v.literal("due"), v.literal("all"), v.literal("learning"), v.literal("cram"))
    ),
    cardIds: v.optional(v.array(v.id("flashcards"))),
    completedAt: v.optional(v.number()),
    cardsStudied: v.number(),
    correctAnswers: v.number(),
    incorrectAnswers: v.number(),
    accuracy: v.number(),
    duration: v.number(), // in minutes
    againCount: v.optional(v.number()),
    hardCount: v.optional(v.number()),
    goodCount: v.optional(v.number()),
    easyCount: v.optional(v.number()),
    sessionType: v.union(
      v.literal("all"),
      v.literal("unmastered"),
      v.literal("review"),
      v.literal("due"),
      v.literal("learning"),
      v.literal("cram")
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_deck", ["deckId"])
    .index("by_user_date", ["userId", "createdAt"]),

  flashcardReviews: defineTable({
    userId: v.id("users"),
    deckId: v.id("flashcardDecks"),
    cardId: v.id("flashcards"),
    rating: v.union(
      v.literal("again"),
      v.literal("hard"),
      v.literal("good"),
      v.literal("easy")
    ),
    reviewedAt: v.number(),
    previousDue: v.optional(v.number()),
    nextDue: v.number(),
    previousState: v.optional(v.string()),
    newState: v.string(),
    responseTimeMs: v.optional(v.number()),
    scheduledDays: v.number(),
  })
    .index("by_user_reviewedAt", ["userId", "reviewedAt"])
    .index("by_card_reviewedAt", ["cardId", "reviewedAt"])
    .index("by_deck_reviewedAt", ["deckId", "reviewedAt"]),

  aiSuggestions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("STUDY_SCHEDULE"),
      v.literal("WEAK_AREAS"),
      v.literal("DECK_RECOMMENDATION"),
      v.literal("STUDY_METHOD"),
      v.literal("GOAL_SETTING"),
      v.literal("PERFORMANCE_INSIGHT")
    ),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
    actionable: v.boolean(),
    metadata: v.any(), // Store additional data like recommended study times, deck IDs, etc.
    isRead: v.boolean(),
    isImplemented: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_priority", ["userId", "priority"])
    .index("by_user_unread", ["userId", "isRead"]),

  studyAnalytics: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    totalStudyTime: v.number(), // in minutes
    cardsStudied: v.number(),
    correctAnswers: v.number(),
    incorrectAnswers: v.number(),
    accuracy: v.number(), // percentage
    streakDays: v.number(),
    decksStudied: v.array(v.id("flashcardDecks")),
    coursesStudied: v.array(v.id("courses")),
    weakAreas: v.array(v.string()), // tags or topics where user struggled
    strongAreas: v.array(v.string()), // tags or topics where user excelled
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_date", ["date"]),
  subscriptionHistory: defineTable({
    userId: v.id("users"),
    fromPlan: v.union(
      v.literal("FREE"),
      v.literal("STUDENT"),
      v.literal("STUDENTPRO")
    ),
    toPlan: v.union(
      v.literal("FREE"),
      v.literal("STUDENT"),
      v.literal("STUDENTPRO")
    ),
    reason: v.union(
      v.literal("UPGRADE"),
      v.literal("DOWNGRADE"),
      v.literal("CANCELLATION"),
      v.literal("RENEWAL"),
      v.literal("PAYMENT_FAILED")
    ),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"]),
  studyGoals: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("DAILY_CARDS"),
      v.literal("DAILY_TIME"),
      v.literal("WEEKLY_DECKS"),
      v.literal("ACCURACY_TARGET"),
      v.literal("STREAK_TARGET")
    ),
    target: v.number(),
    current: v.number(),
    period: v.union(
      v.literal("DAILY"),
      v.literal("WEEKLY"),
      v.literal("MONTHLY")
    ),
    isActive: v.boolean(),
    achievedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"])
    .index("by_user_type", ["userId", "type"]),
  pomodoroSessions: defineTable({
    courseId: v.id("courses"),
    type: v.union(
      v.literal("pomodoro"),
      v.literal("shortBreak"),
      v.literal("longBreak")
    ),
    duration: v.number(),
    completedAt: v.number(),
    userId: v.id("users"),
    topicId: v.optional(v.id("courseTopics")),
    studyPlanItemId: v.optional(v.id("studyPlanItems")),
    assignmentId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_date", ["completedAt"]),

  userSettings: defineTable({
    userId: v.id("users"),
    // Notification settings
    emailNotifications: v.boolean(),
    pushNotifications: v.boolean(),
    studyReminders: v.boolean(),
    assignmentReminders: v.optional(v.boolean()),
    examReminders: v.optional(v.boolean()),
    reminderTime: v.optional(v.string()), // Format: "HH:MM"
    weeklyReport: v.boolean(),

    // Timer/Pomodoro settings
    pomodoroMinutes: v.number(),
    shortBreakMinutes: v.number(),
    longBreakMinutes: v.number(),
    sessionsBeforeLongBreak: v.number(),
    autoStartBreaks: v.boolean(),
    autoStartPomodoros: v.boolean(),

    // Study preferences
    dailyStudyGoal: v.number(), // in minutes
    studyMode: v.union(
      v.literal("focused"),
      v.literal("relaxed"),
      v.literal("intensive")
    ),
    showTimer: v.boolean(),
    playSound: v.boolean(),

    // GPA settings
    gpaTarget: v.optional(v.number()),
    gpaScale: v.union(v.literal("4.0"), v.literal("5.0")),

    // Display preferences
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    language: v.string(),

    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("assignment"),
      v.literal("exam"),
      v.literal("study_session"),
      v.literal("subscription"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    dedupKey: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_user_read", ["userId", "isRead"])
    .index("by_user_dedup", ["userId", "dedupKey"]),

  subscriptionChanges: defineTable({
    userId: v.id("users"),
    subscriptionId: v.id("subscriptions"),
    changeType: v.union(
      v.literal("upgrade"),
      v.literal("downgrade"),
      v.literal("plan_change"),
      v.literal("canceled"),
      v.literal("reactivated")
    ),
    fromProductId: v.optional(v.string()),
    toProductId: v.optional(v.string()),
    fromPriceId: v.optional(v.string()),
    toPriceId: v.optional(v.string()),
    effectiveDate: v.number(),
    prorationAmount: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_subscription", ["subscriptionId"]),

  usageTracking: defineTable({
    userId: v.id("users"),
    feature: v.union(
      v.literal("COURSES_CREATED"),
      v.literal("DECKS_CREATED"),
      v.literal("CARDS_CREATED"),
      v.literal("AI_GENERATIONS"),
      v.literal("DATA_EXPORTS"),
      v.literal("ANALYTICS_VIEWS"),
      v.literal("GOOGLE_MEET_CREATED")
    ),
    count: v.number(),
    lastReset: v.number(), // timestamp of last monthly reset
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_feature", ["userId", "feature"]),

  featureLimits: defineTable({
    plan: v.union(
      v.literal("FREE"),
      v.literal("STUDENT"),
      v.literal("STUDENTPRO")
    ),
    feature: v.string(),
    limit: v.number(), // -1 for unlimited
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_plan", ["plan"])
    .index("by_plan_feature", ["plan", "feature"])
    .index("by_active", ["isActive"]),

  conversations: defineTable({
    userId: v.string(),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Chat messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

  // Generated content (essays, summaries, study guides)
  generatedContent: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("essay"),
      v.literal("summary"),
      v.literal("study_guide")
    ),
    prompt: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_user_and_type", ["userId", "type"]),
  assignments: defineTable({
    userId: v.string(),
    courseId: v.optional(v.id("courses")),
    title: v.string(),
    description: v.string(),
    dueDate: v.optional(v.string()),
    subject: v.optional(v.string()),
    extractedFrom: v.string(), // Original text that was parsed
    source: v.optional(v.union(v.literal("manual"), v.literal("google-classroom"))),
    externalId: v.optional(v.string()),
    externalUpdatedAt: v.optional(v.string()),
    alternateLink: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_source_external", ["userId", "source", "externalId"]),

  courseDocuments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    title: v.string(),
    fileName: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    storageId: v.optional(v.id("_storage")),
    source: v.union(
      v.literal("upload"),
      v.literal("manual-note"),
      v.literal("google-drive"),
      v.literal("onedrive"),
      v.literal("google-classroom"),
      v.literal("canvas"),
      v.literal("microsoft-education")
    ),
    processingStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("failed")
    ),
    processingError: v.optional(v.string()),
    pageCount: v.optional(v.number()),
    textContent: v.optional(v.string()),
    chunkCount: v.optional(v.number()),
    fileUrl: v.optional(v.string()),
    externalId: v.optional(v.string()),
    externalUpdatedAt: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"])
    .index("by_user_source_external", ["userId", "source", "externalId"])
    .index("by_course_status", ["courseId", "processingStatus"])
    .index("by_source", ["source"]),

  documentChunks: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    documentId: v.id("courseDocuments"),
    content: v.string(),
    chunkIndex: v.number(),
    pageNumber: v.optional(v.number()),
    section: v.optional(v.string()),
    heading: v.optional(v.string()),
    tokenCount: v.optional(v.number()),
    keywords: v.optional(v.array(v.string())),
    embedding: v.optional(v.array(v.number())),
    createdAt: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),

  courseTopics: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    name: v.string(),
    source: v.optional(v.string()),
    parentTopicId: v.optional(v.id("courseTopics")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"])
    .index("by_user_course_name", ["userId", "courseId", "name"]),

  studentTopicMastery: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    topicId: v.id("courseTopics"),
    masteryScore: v.number(),
    confidenceScore: v.number(),
    correctAnswers: v.number(),
    incorrectAnswers: v.number(),
    lastStudiedAt: v.optional(v.number()),
    nextRecommendedReviewAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user_course", ["userId", "courseId"])
    .index("by_user_topic", ["userId", "topicId"])
    .index("by_course_topic", ["courseId", "topicId"]),

  studyPlans: defineTable({
    userId: v.id("users"),
    courseId: v.optional(v.id("courses")),
    title: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    generatedFrom: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_course", ["courseId"]),

  studyPlanItems: defineTable({
    userId: v.id("users"),
    studyPlanId: v.id("studyPlans"),
    courseId: v.optional(v.id("courses")),
    topicId: v.optional(v.id("courseTopics")),
    assignmentId: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    reason: v.optional(v.string()),
    scheduledStart: v.number(),
    scheduledEnd: v.number(),
    durationMinutes: v.number(),
    status: v.union(
      v.literal("planned"),
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("skipped")
    ),
    calendarEventId: v.optional(v.id("events")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_plan", ["studyPlanId"])
    .index("by_user", ["userId"])
    .index("by_user_start", ["userId", "scheduledStart"])
    .index("by_course", ["courseId"]),

  aiRequests: defineTable({
    userId: v.string(),
    requestId: v.string(),
    provider: v.union(v.literal("deepseek"), v.literal("openai")),
    model: v.string(),
    feature: v.string(),
    mode: v.optional(
      v.union(v.literal("standard"), v.literal("deep-reasoning"))
    ),
    courseId: v.optional(v.string()),
    courseName: v.optional(v.string()),
    promptVersion: v.optional(v.string()),
    inputTokens: v.number(),
    cachedInputTokens: v.optional(v.number()),
    outputTokens: v.number(),
    reasoningTokens: v.optional(v.number()),
    totalTokens: v.number(),
    estimatedCostUSD: v.number(),
    creditsUsed: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    status: v.union(
      v.literal("reserved"),
      v.literal("success"),
      v.literal("error"),
      v.literal("canceled")
    ),
    errorCode: v.optional(v.string()),
    retrievalChunkCount: v.optional(v.number()),
    retrievalLatencyMs: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_user_request", ["userId", "requestId"])
    .index("by_user_feature", ["userId", "feature"])
    .index("by_feature", ["feature"])
    .index("by_model", ["model"])
    .index("by_status", ["status"]),

  aiTokenUsage: defineTable({
    userId: v.string(),
    model: v.string(),
    feature: v.string(),
    courseId: v.optional(v.string()),
    courseName: v.optional(v.string()),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    estimatedCostUSD: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_feature", ["feature"])
    .index("by_created", ["createdAt"]),
});

export default schema;
