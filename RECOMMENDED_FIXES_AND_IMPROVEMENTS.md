# Recommended Fixes and Improvements

## 🔴 Critical Issues (Fix Immediately)

### 1. **Usage Tracking Hook - Critical Bug**
**File:** `hooks/use-usage-tracking.ts`  
**Issue:** Line 23-26 - The `canPerformAction` query is called with an empty string for the `feature` parameter, which means it will never work correctly.

```typescript
// ❌ WRONG - Line 23-26
const canPerformAction = useQuery(api.featureLimits.canPerformAction, {
  userId: userId!,
  feature: "",  // This is always empty!
});
```

**Fix:** The `canPerformAction` should be called dynamically within the functions that need it, not at the hook level.

**Impact:** This breaks the entire usage tracking and feature limits system. Users might be able to bypass limits or get incorrect error messages.

---

### 2. **SessionStorage in Server-Side Components**
**Files:** 
- `app/dashboard/(dashboard)/components/student-dashboard.tsx`
- `app/(auth)/auth/components/authentication-card.tsx`

**Issue:** Direct use of `sessionStorage` can cause SSR hydration errors.

**Fix:** Wrap all `sessionStorage` access in checks:
```typescript
if (typeof window !== 'undefined') {
  sessionStorage.setItem(...)
}
```

**Impact:** Can cause "window is not defined" errors and hydration mismatches.

---

### 3. **Access Token in URL (Security Issue)**
**File:** `app/api/google-meet/callback/route.ts`  
**Line:** 27

**Issue:** Passing access tokens via URL query parameters is insecure:
```typescript
return NextResponse.redirect(
  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?google_token=${accessToken}`
)
```

**Fix:** Use secure httpOnly cookies or encrypted session storage instead.

**Impact:** Access tokens can be leaked through browser history, server logs, and referrer headers.

---

## 🟠 High Priority Issues

### 4. **Commented Out Code**
**File:** `app/api/chat/route.ts`  
**Lines:** 18-106

**Issue:** Large blocks of commented code that should either be removed or moved to version control.

**Fix:** Remove the commented code entirely. If needed, it can be recovered from git history.

**Impact:** Code maintenance difficulty, confusion for developers, increases file size.

---

### 5. **Type Safety - Excessive Use of `any`**
**Files:**
- `lib/google-meet.ts` (lines 137, 177, 179)
- `app/dashboard/(dashboard)/study-groups/_components/study-group-card.tsx` (lines 25, 49, 147)
- `app/dashboard/(dashboard)/study-groups/_components/shared-content.tsx` (lines 92, 153, 198)
- Multiple other study group components

**Issue:** Using `any` type defeats TypeScript's type checking.

**Fixes:**

```typescript
// Instead of:
const StudyGroupCard = ({ group }: { group: any }) => { ... }

// Use proper types:
import { Doc } from "@/convex/_generated/dataModel";
const StudyGroupCard = ({ group }: { group: Doc<"studyGroups"> & { course: Doc<"courses"> | null } }) => { ... }
```

**Impact:** Type errors won't be caught at compile time, leading to runtime errors.

---

### 6. **Missing Error Handling in Chat API**
**File:** `app/api/chat/route.ts`  
**Lines:** 7-15

**Issue:** No try-catch block, no validation, no error handling.

```typescript
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  // No validation or error handling!
  const result = streamText({
    model: openai("gpt-4o"),
    messages: convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
```

**Fix:**
```typescript
export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const result = streamText({
      model: openai("gpt-4o"),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
```

**Impact:** Unhandled errors can crash the API route and provide poor user experience.

---

### 7. **Inconsistent Error Message Format**
**Files:** Multiple API routes in `app/api/`

**Issue:** Different API routes return errors in different formats:
- Some return `{ error: "..." }`
- Some return `{ error: "...", details: "..." }`
- Some return `{ error: "...", success: false }`

**Fix:** Create a standardized error response utility:

```typescript
// lib/api-helpers.ts
export function errorResponse(
  message: string,
  status: number = 500,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

export function successResponse<T>(data: T) {
  return NextResponse.json({
    success: true,
    data,
  });
}
```

**Impact:** Inconsistent error handling on the frontend, harder to debug.

---

## 🟡 Medium Priority Issues

### 8. **Missing Input Validation**
**File:** `app/api/generate-essay/route.ts`, `app/api/generate-study-guide/route.ts`, etc.

**Issue:** No validation for user inputs before calling AI APIs.

**Fix:** Add validation using Zod:
```typescript
import { z } from 'zod';

const essaySchema = z.object({
  topic: z.string().min(10).max(500),
  length: z.number().min(100).max(5000),
  academicLevel: z.enum(['high-school', 'undergraduate', 'graduate']),
  userId: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = essaySchema.parse(body);
    // ... rest of the code
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("Invalid input", 400, error.errors);
    }
    // ... other error handling
  }
}
```

**Impact:** Users can send malformed data that wastes AI API credits and causes errors.

---

### 9. **Hardcoded Rate Limits**
**File:** `convex/featureLimits.ts`  
**Lines:** 152-183

**Issue:** Feature limits are hardcoded in the mutation instead of being configurable.

**Fix:** Move default limits to a configuration file:
```typescript
// constants/feature-limits.ts
export const DEFAULT_FEATURE_LIMITS = {
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
    ANALYTICS_VIEWS: -1,
    GOOGLE_MEET_CREATED: 10,
  },
  STUDENTPRO: {
    COURSES_CREATED: -1,
    DECKS_CREATED: -1,
    CARDS_CREATED: -1,
    AI_GENERATIONS: -1,
    DATA_EXPORTS: -1,
    ANALYTICS_VIEWS: -1,
    GOOGLE_MEET_CREATED: -1,
  },
} as const;
```

**Impact:** Changing limits requires code changes and deployment.

---

### 10. **Console.log Statements in Production**
**Issue:** 31 `console.log` statements found across 16 files.

**Files with most console.logs:**
- `app/dashboard/(dashboard)/transcript/page.tsx`
- `app/api/google-meet/auth/route.ts`
- `components/calendar/calendar-body.tsx`

**Fix:** 
1. Remove debugging console.logs
2. Replace important logs with proper logging service
3. Use environment-based logging:

```typescript
// lib/logger.ts
export const logger = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error(...args);
    // In production, send to error tracking service (Sentry, etc.)
  },
};
```

**Impact:** Sensitive data leakage, performance impact, cluttered console in production.

---

### 11. **Missing Database Indexes**
**File:** `convex/schema.ts`

**Issue:** Some frequently queried fields might not have proper indexes.

**Review needed for:**
- `studyGroupInvites` - ensure `by_code` index exists
- `sharedContent` - ensure `by_group` index exists
- `studyTogetherSessions` - ensure `by_group` index exists

**Fix:** Verify and add missing indexes:
```typescript
studyTogetherSessions: defineTable({
  // ... fields
}).index("by_group", ["studyGroupId"])
  .index("by_creator", ["createdBy"])
  .index("by_active", ["isActive", "endTime"]),
```

**Impact:** Slow queries as data grows, higher database costs.

---

### 12. **Duplicate Default Time Logic**
**File:** `components/google-meeting-integration.tsx`  
**Lines:** 130-141

**Issue:** Default times are calculated every render.

**Fix:**
```typescript
const [meetingForm, setMeetingForm] = useState(() => {
  const now = new Date();
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  
  return {
    summary: "",
    description: "",
    startTime: start.toISOString().slice(0, 16),
    endTime: end.toISOString().slice(0, 16),
    attendees: "",
  };
});
```

**Impact:** Minor performance issue, unnecessary calculations.

---

## 🟢 Low Priority / Nice to Have

### 13. **Error Messages Not User-Friendly**
**Example:** `app/dashboard/(dashboard)/courses/_components/add-courses.tsx` line 168
```typescript
toast.error("Failed to add course:"); // No actual error message shown!
```

**Fix:**
```typescript
toast.error(`Failed to add course: ${error instanceof Error ? error.message : 'Unknown error'}`);
```

---

### 14. **Magic Numbers**
**Files:** Multiple

**Issue:** Hardcoded numbers without explanation:
- `7 * 24 * 60 * 60 * 1000` (invite expiration)
- `30 * 24 * 60 * 60 * 1000` (monthly reset)
- `50` (max invite uses)

**Fix:** Create constants:
```typescript
// constants/time.ts
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const MS_PER_WEEK = 7 * MS_PER_DAY;
export const MS_PER_MONTH = 30 * MS_PER_DAY;

// constants/limits.ts
export const MAX_INVITE_USES = 50;
export const INVITE_EXPIRY_DAYS = 7;
```

---

### 15. **Missing Authentication Checks**
**Issue:** Some Convex mutations don't verify the user making the request.

**Example:** `convex/studyGroups.ts` - `updateStudyGroup` doesn't check if the requester is the organizer.

**Fix:**
```typescript
export const updateStudyGroup = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Study group not found");
    
    // Check if user is the organizer
    if (group.organizerId !== identity.subject) {
      throw new Error("Only the organizer can update this group");
    }
    
    // ... rest of the code
  },
});
```

**Impact:** Security vulnerability - any authenticated user could modify any group.

---

### 16. **Dead Code - Disabled Buttons**
**File:** `components/google-meeting-integration.tsx`  
**Lines:** 312-344

**Issue:** Four buttons that are always disabled and don't do anything.

**Fix:** Either implement the functionality or remove the buttons.

---

### 17. **Missing Loading States**
**Issue:** Some components don't show loading states while fetching data.

**Fix:** Add proper loading indicators:
```typescript
const user = useQuery(api.users.currentUser);
const courses = useQuery(api.courses.getUserCourses, 
  user?._id ? { userId: user._id } : "skip"
);

if (user === undefined || courses === undefined) {
  return <LoadingSkeleton />;
}
```

---

### 18. **Environment Variable Validation**
**Issue:** No validation that required environment variables are set.

**Fix:** Create a startup validation:
```typescript
// lib/env-validation.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_CONVEX_URL',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'OPENAI_API_KEY',
] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (key) => !process.env[key]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Call in app/layout.tsx or middleware
validateEnv();
```

---

## 📊 Summary

| Priority | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 3 | Fix immediately - breaks functionality or security issues |
| 🟠 High | 8 | Fix soon - impacts UX, maintainability, or performance |
| 🟡 Medium | 5 | Should fix - code quality and future scalability |
| 🟢 Low | 8 | Nice to have - minor improvements |
| **Total** | **24** | **Total issues identified** |

---

## 🎯 Recommended Action Plan

### Week 1: Critical & High Priority
1. Fix usage tracking hook bug (#1)
2. Fix sessionStorage SSR issues (#2)
3. Fix access token security issue (#3)
4. Remove commented code (#4)
5. Add proper types instead of `any` (#5)

### Week 2: Medium Priority
6. Add error handling to chat API (#6)
7. Standardize API error responses (#7)
8. Add input validation (#8)
9. Create configurable feature limits (#9)

### Week 3: Low Priority & Polish
10. Replace console.logs with proper logging (#10)
11. Review and add database indexes (#11)
12. Improve error messages (#13)
13. Add authentication checks (#15)

---

## 🛠️ Tools to Consider

1. **Error Tracking:** Sentry or LogRocket
2. **Type Safety:** Consider stricter TypeScript config
3. **Linting:** Add ESLint rules for `any` types and console.logs
4. **Testing:** Add unit tests for critical functions
5. **API Testing:** Add integration tests for API routes
6. **Code Review:** Set up automated code review tools

---

## 📝 Notes

- Many of these issues are typical in early-stage applications
- Fixing the critical issues should be prioritized
- Consider setting up a CI/CD pipeline with automated checks
- Regular code reviews can catch these issues earlier

---

**Generated:** $(date)  
**Review Status:** Pending  
**Last Updated:** $(date)

